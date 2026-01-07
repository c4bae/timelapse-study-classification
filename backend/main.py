import torch
from torch.utils.data import Dataset
from torchvision import transforms
from PIL import Image
import cv2
from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
import boto3
import os
import shutil
from pathlib import Path
from dotenv import load_dotenv
from train import compress_frame, DataLoader, StudyHabitClassifier
from ultralytics import YOLO
from supabase import create_client
from moviepy import VideoFileClip

load_dotenv()

app = FastAPI()
device = torch.device('mps')
s3 = boto3.resource('s3', aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'), aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'))
bucket = s3.Bucket('studylapsedata')

supabase = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_SERVICE_ROLE_KEY'))
yolo_model = YOLO('./models/yolov8n.pt')

class InferenceDataset(Dataset):
    def __init__(self, data_dir):
        self.data_dir = data_dir
        self.image_files = [f for f in os.listdir(data_dir) if f.lower().endswith('.jpg')]

        self.transform = transforms.Compose([
            transforms.Resize(256),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])

    def __len__(self):
        return len(self.image_files)

    def __getitem__(self, idx):
        path = os.path.join(self.data_dir, self.image_files[idx])
        # Must convert the image to RGB before converting to a tensor
        image = Image.open(path).convert("RGB")
        image = self.transform(image)

        return image

    def get_frame_number(self, idx):
        filename = self.image_files[idx]
        frame_number = int(filename.replace('frame', '').replace('.jpg', ''))
        return frame_number

def obtain_video_frames(video_path, output_path, user_id, video_name):
    cap = cv2.VideoCapture(video_path)
    total_frames = 0
    current_frame = 0
    frame_interval = 8
    first_frame_obtained = False
    frames_timestamps = {}

    while True:
        success, frame = cap.read()
        if not success:
            break

        if current_frame % frame_interval == 0:
            timestamp_ms = cap.get(cv2.CAP_PROP_POS_MSEC)
            timestamp = timestamp_ms / 1000.0
            
            frames_timestamps[current_frame] = timestamp

            compressed_img = compress_frame(frame)
            cv2.imwrite(f"{output_path}/frame{int(current_frame)}.jpg", compressed_img)
            total_frames += 1

            if not first_frame_obtained:
                bucket.upload_file(f"{output_path}/frame{int(current_frame)}.jpg", f"{user_id}/{video_name}/{video_name}frame0.jpg")
                first_frame_obtained = True

            cv2.waitKey(1)
        
        current_frame += 1
    
    cap.release()

    return total_frames, frames_timestamps


def check_frames_for_absence(images_directory, frames_timestamps):
    absent_timestamps = []
    absent_img_num = 0

    for file_name in os.listdir(images_directory):
        full_path = os.path.join(images_directory, file_name)

        if Path(full_path).suffix.lower() == '.jpg':
            frame_number = int(file_name.replace('frame', '').replace('.jpg', ''))
            # [0] refers to the people class in the COCO dataset
            results = yolo_model.predict(full_path, classes=[0], verbose=False)
            people_num = len(results[0].boxes)

            if not people_num:
                timestamp = frames_timestamps.get(frame_number)
                absent_img_num += 1
                if timestamp is not None:
                    absent_timestamps.append(timestamp)

                os.remove(full_path)
                print("Absence in frame detected, file removed")
        
        else:
            continue
    
    return absent_img_num, absent_timestamps

def load_model():
    model = StudyHabitClassifier(num_classes=2)
    model.load_state_dict(torch.load("./models/timelapse_model.pth"))

    model.to(device)
    model.eval()

    return model

loaded_model = load_model()

def test_model(model, loader, dataset, frames_timestamps):
    phone_timestamps = []
    phone_img_num = 0
    current_idx = 0

    with torch.no_grad():
        for inputs in loader:
            inputs = inputs.to(device)

            outputs = model(inputs)

            _, preds = torch.max(outputs, 1)

            for j in range(inputs.size(0)):
                if int(preds[j]) == 0:
                    phone_img_num += 1
                    frame_number = dataset.get_frame_number(current_idx)
                    timestamp = frames_timestamps.get(frame_number)
                    if timestamp is not None:
                        phone_timestamps.append(timestamp)
                    
                current_idx += 1

    return phone_img_num, phone_timestamps


def process_video(user_id, video_name):
    video_path = Path(f"./user_videos/{user_id}/{video_name}/frames")
    video_path.mkdir(parents=True, exist_ok=True)
    bucket.download_file(f"{user_id}/{video_name}", f"./user_videos/{user_id}/{video_name}/{video_name}")
    total_frames_num, frames_timestamps = obtain_video_frames(f"./user_videos/{user_id}/{video_name}/{video_name}", f"./user_videos/{user_id}/{video_name}/frames", user_id, video_name)

    absence_frames_num, absence_timestamps = check_frames_for_absence(video_path, frames_timestamps)

    dataset = InferenceDataset(video_path)
    loader = DataLoader(dataset, batch_size=32, shuffle=False)
    phone_frames_num, phone_timestamps = test_model(loaded_model, loader, dataset, frames_timestamps)
    
    video = VideoFileClip(f"./user_videos/{user_id}/{video_name}/{video_name}")
    video_duration = round(video.duration / 3600, 2)

    shutil.rmtree(f"./user_videos/{user_id}/{video_name}")

    absent_rate = round(absence_frames_num/total_frames_num * 100, 2)
    phone_rate = round(phone_frames_num/total_frames_num * 100, 2)
    focus_rate = round(100 - absent_rate - phone_rate, 2)

    # Update user_videos db
    try:
        response = (
            supabase.table("user_videos")
            .insert({"user_id": user_id, "video_name": video_name, "duration": video_duration, "focus_percentage": focus_rate, "absent_percentage": absent_rate, "phone_percentage": phone_rate, "absent_timestamps": absence_timestamps, "phone_timestamps": phone_timestamps})
            .execute()
        )

    except Exception as e:
        print(e)

    # Update user_stats db, first fetch values
    try:
        result = (
            supabase.table("user_stats")
            .select("*")
            .eq("user_id", user_id)
            .single()
            .execute()
        )

        cur_total_videos = result.data["total_videos"] + 1
        cur_total_hours = result.data["total_hours"] + video_duration
        cur_focus_rate = round((result.data["focus_rate"] * result.data["total_videos"] + focus_rate) / cur_total_videos, 2)

        print(f"Total videos now: {cur_total_videos}")
        print(f"Total hours now: {cur_total_hours}")
        print(f"Total focus rate now: {cur_focus_rate}")

        response = (
            supabase.table("user_stats")
            .update({"total_videos": cur_total_videos, "total_hours": cur_total_hours, "focus_rate": cur_focus_rate})
            .eq("user_id", user_id)
            .execute()
        )
    
    except Exception as e:
        print(e)


class Video(BaseModel):
    user_id: str
    video_name: str


@app.post("/api/process")
def analyze_video(video_data: Video, background_tasks: BackgroundTasks):
    background_tasks.add_task(process_video, video_data.user_id, video_data.video_name)

    return "Payload received"
