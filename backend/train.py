import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import torchvision.transforms as transforms
from torchvision.datasets import ImageFolder

import cv2

import matplotlib.pyplot as plt
from tqdm import tqdm

from model_arch import StudyHabitClassifier

# Compress images
def compress_frame(img, quality=50):
    encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), quality]
    _, encoded_img = cv2.imencode('.jpg', img, encode_param)

    decoded_img = cv2.imdecode(encoded_img, cv2.IMREAD_COLOR)

    return decoded_img


# Obtain frames from videos
def obtain_frames(video_p, output_p, frames_num, starting_num) -> None:
    video_index = 0
    current_frame = starting_num
    video_path = video_p
    output_path = output_p

    cap = cv2.VideoCapture(video_path)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    frame_interval = int(total_frames/frames_num)

    while True:
        success, frame = cap.read()
        if not success:
            break

        if video_index % frame_interval == 0:
            cv2.imshow('image', frame)

            compressed_img = compress_frame(frame)
            cv2.imwrite(f"{output_path}/frame{int(current_frame)}.jpg", compressed_img)

            print(f"Saved frame #{int(current_frame)}")
            current_frame += 1
            cv2.waitKey(1)

        video_index += 1

    cap.release()

# Initialize frames from videos
def initialize_data() -> None:
    # Training videos
    doomscroll_vid = "videos/training/doomscroll_vid.mov"
    doomscroll_vid2 = "videos/training/doomscroll_vid2.mov"
    doomscroll_vid3 = "videos/training/doomscroll_vid3.mov"
    doomscroll_vid4 = "videos/training/doomscroll_vid4.mov"
    doomscroll_vid5 = "videos/training/doomscroll_vid5.mov"

    studying_vid = "videos/training/studying_vid.mov"
    studying_vid2 = "videos/training/studying_vid2.mov"
    studying_vid3 = "videos/training/studying_vid3.mov"
    studying_vid4 = "videos/training/studying_vid4.mov"
    studying_vid5 = "videos/training/studying_vid5.mov"
    studying_vid6 = "videos/training/studying_vid6.mov"

    # Validation videos
    valid_doomscroll_vid = "videos/validation/doomscroll.mov"
    valid_doomscroll_vid2 = "videos/validation/doomscroll2.mov"
    valid_studying_vid = "videos/validation/studying.mov"
    valid_studying_vid2 = "videos/validation/studying2.mov"

    # Testing videos
    test_doomscroll_vid = "videos/testing/doomscroll.mov"
    test_studying_vid = "videos/testing/studying.mov"

    # Outputs
    train_doomscroll_output = "data/training/doomscrolling"
    train_studying_output = "data/training/studying"

    valid_doomscroll_output = "data/validation/doomscrolling"
    valid_studying_output = "data/validation/studying"

    test_doomscroll_output = "data/testing/doomscrolling"
    test_studying_output = "data/testing/studying"

    # Frames for training data
    obtain_frames(doomscroll_vid, train_doomscroll_output, 500, 0)
    obtain_frames(doomscroll_vid2, train_doomscroll_output, 500, 501)
    obtain_frames(doomscroll_vid3, train_doomscroll_output, 500, 1002)
    obtain_frames(doomscroll_vid4, train_doomscroll_output, 500, 1503)
    obtain_frames(doomscroll_vid5, train_doomscroll_output, 500, 2004)

    obtain_frames(studying_vid, train_studying_output, 500, 0)
    obtain_frames(studying_vid2, train_studying_output, 500, 501)
    obtain_frames(studying_vid3, train_studying_output, 500, 1002)
    obtain_frames(studying_vid4, train_studying_output, 500, 1503)
    obtain_frames(studying_vid5, train_studying_output, 500, 2004)
    obtain_frames(studying_vid6, train_studying_output, 500, 2505)

    # Frames for validation data
    obtain_frames(valid_doomscroll_vid, valid_doomscroll_output, 600, 0)
    obtain_frames(valid_doomscroll_vid2, valid_doomscroll_output, 600, 601)
    obtain_frames(valid_studying_vid, valid_studying_output, 600, 0)
    obtain_frames(valid_studying_vid2, valid_studying_output, 600, 601)

    # Frames for testing data
    obtain_frames(test_doomscroll_vid, test_doomscroll_output, 10, 0)
    obtain_frames(test_studying_vid, test_studying_output, 10, 0)
    
# Initialize dataset class
class VideoDataset(Dataset):
    def __init__(self, data_dir, transform=None):
        self.data = ImageFolder(data_dir, transform=transform)

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        return self.data[idx]

    @property
    def classes(self):
        return self.data.classes
    
# Transformations
transform = transforms.Compose([
    transforms.RandomHorizontalFlip(p=0.5),
    transforms.ColorJitter(brightness=0.5, contrast=0.5, saturation=0.5),
    transforms.RandomResizedCrop(size=224, scale=(0.85, 1.0)),
    transforms.RandomRotation(degrees=10),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    transforms.RandomErasing(p=0.5, scale=(0.1, 0.1))
])

device = torch.device("mps")
model = StudyHabitClassifier(num_classes=2)
train_losses, val_losses = [], []

# Train model using Cross Entropy Loss optimization
def train_model():
    num_epoch = 12

    print(device)

    model.to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.0001, weight_decay=0.0001)

    train_folder = "data/training"
    valid_folder = "data/validation"
    test_folder = "data/testing"

    train_dataset = VideoDataset(train_folder, transform)
    valid_dataset = VideoDataset(valid_folder, transform)

    train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)
    valid_loader = DataLoader(valid_dataset, batch_size=32, shuffle=False)

    # Begin training loop
    for epoch in tqdm(range(num_epoch), desc="Overall Training Loop"):
        model.train()
        running_loss = 0.0

        for images, labels in tqdm(train_loader, desc="Training Loop"):
            images, labels = images.to(device), labels.to(device)
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            running_loss += loss.item() * images.size(0)

        train_loss = running_loss / len(train_dataset)
        train_losses.append(train_loss)

        model.eval()
        running_loss = 0.0
        with torch.no_grad():
            for images, labels in tqdm(valid_loader, desc="Validation Loop"):
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                loss = criterion(outputs, labels)
                running_loss += loss.item() * images.size(0)

        val_loss = running_loss / len(valid_dataset)
        val_losses.append(val_loss)

        print(f"Epoch {epoch + 1}/{num_epoch} - Train Loss: {train_loss} - Validation Loss: {val_loss}")


# Plot a graph of the losses
plt.plot(train_losses, label='Training loss')
plt.plot(val_losses, label='Validation loss')
plt.legend()
plt.title("Loss across epochs")
plt.show()
