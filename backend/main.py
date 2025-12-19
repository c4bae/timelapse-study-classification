import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader, random_split
import torchvision.transforms as transforms
from torchvision.datasets import ImageFolder
import timm

import cv2

import matplotlib
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
import sys
from tqdm import tqdm


def compress_frame(img, quality=50):
    encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), quality]
    _, encoded_img = cv2.imencode('.jpg', img, encode_param)

    decoded_img = cv2.imdecode(encoded_img, cv2.IMREAD_COLOR)

    return decoded_img


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


def initialize_data() -> None:
    # Training videos
    absent_vid = "../videos/training/absent_vid.mov"
    absent_vid2 = "../videos/training/absent_vid2.mov"

    doomscroll_vid = "../videos/training/doomscroll_vid.mov"
    doomscroll_vid2 = "../videos/training/doomscroll_vid2.mov"
    doomscroll_vid3 = "../videos/training/doomscroll_vid3.mov"

    studying_vid = "../videos/training/studying_vid.mov"
    studying_vid2 = "../videos/training/studying_vid2.mov"
    studying_vid3 = "../videos/training/studying_vid3.mov"
    studying_vid4 = "../videos/training/studying_vid4.mov"

    # Validation videos
    valid_absent_vid = "../videos/validation/absent.mov"
    valid_doomscroll_vid = "../videos/validation/doomscroll.mov"
    valid_studying_vid = "../videos/validation/studying.mov"

    # Testing videos
    test_absent_vid = "../videos/testing/absent.mov"
    test_doomscroll_vid = "../videos/testing/doomscroll.mov"
    test_studying_vid = "../videos/testing/studying.mov"

    # Outputs
    train_absent_output = "../data/training/absent"
    train_doomscroll_output = "../data/training/doomscrolling"
    train_studying_output = "../data/training/studying"

    valid_absent_output = "../data/validation/absent"
    valid_doomscroll_output = "../data/validation/doomscrolling"
    valid_studying_output = "../data/validation/studying"

    test_absent_output = "../data/testing/absent"
    test_doomscroll_output = "../data/testing/doomscrolling"
    test_studying_output = "../data/testing/studying"

    # Frames for training data
    obtain_frames(absent_vid, train_absent_output, 500, 0)
    obtain_frames(absent_vid2, train_absent_output, 500, 501)

    obtain_frames(doomscroll_vid, train_doomscroll_output, 500, 0)
    obtain_frames(doomscroll_vid2, train_doomscroll_output, 500, 501)
    obtain_frames(doomscroll_vid3, train_doomscroll_output, 500, 1002)

    obtain_frames(studying_vid, train_studying_output, 500, 0)
    obtain_frames(studying_vid2, train_studying_output, 500, 501)
    obtain_frames(studying_vid3, train_studying_output, 500, 1002)
    obtain_frames(studying_vid4, train_studying_output, 500, 1503)

    # Frames for validation data
    obtain_frames(valid_absent_vid, valid_absent_output, 600, 0)
    obtain_frames(valid_doomscroll_vid, valid_doomscroll_output, 600, 0)
    obtain_frames(valid_studying_vid, valid_studying_output, 600, 0)

    # Frames for testing data
    obtain_frames(test_absent_vid, test_absent_output, 10, 0)
    obtain_frames(test_doomscroll_vid, test_doomscroll_output, 10, 0)
    obtain_frames(test_studying_vid, test_studying_output, 10, 0)


# initialize_data()


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


class StudyHabitClassifier(nn.Module):
    def __init__(self, num_classes=3):
        super().__init__()
        self.base_model = timm.create_model('efficientnet_b0', pretrained=True)
        self.features = nn.Sequential(*list(self.base_model.children())[:-1])
        enet_out_size = 1280

        self.classifier = nn.Linear(enet_out_size, num_classes)

    def forward(self, x):
        x = self.features(x)

        x = x.flatten(1)

        output = self.classifier(x)
        return output


# Transformations
transform = transforms.Compose([
    transforms.RandomHorizontalFlip(p=0.5),
    transforms.ColorJitter(brightness=0.3, contrast=0.2, saturation=0.2),
    transforms.RandomResizedCrop(size=128, scale=(0.08, 1.0)),
    transforms.ToTensor(),
    transforms.RandomErasing(p=0.5, scale=(0.1, 0.1))
])

train_folder = "../data/training"
valid_folder = "../data/validation"
test_folder = "../data/testing"

train_dataset = VideoDataset(train_folder, transform)
valid_dataset = VideoDataset(valid_folder, transform)
test_dataset = VideoDataset(test_folder, transform)

train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)
valid_loader = DataLoader(valid_dataset, batch_size=32, shuffle=False)
test_loader = DataLoader(test_dataset, batch_size=32, shuffle=False)

num_epoch = 5
train_losses, val_losses = [], []

device = torch.device("mps")
print(device)

model = StudyHabitClassifier(num_classes=3)
model.to(device)

criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.0001)

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


def visualize_predictions(model, loader, num_images=12):
    model.eval()
    images_so_far = 0
    plt.figure(figsize=(12,8))

    with torch.no_grad():
        for i, (inputs, labels) in enumerate(loader):
            inputs = inputs.to(device)
            labels = labels.to(device)

            outputs = model(inputs)
            print(outputs)

            _, preds = torch.max(outputs, 1)

            for j in range(inputs.size(0)):
                images_so_far += 1

                ax = plt.subplot(num_images // 3, 3, images_so_far)
                ax.axis('off')

                predicted_class = test_dataset.classes[preds[j]]
                actual_class = test_dataset.classes[labels[j]]

                color = 'green' if predicted_class == actual_class else 'red'
                ax.set_title(f'Predicted: {predicted_class}\nActual: {actual_class}', color=color)

                ax.imshow(inputs.cpu().data[j].permute(1, 2, 0))

                if images_so_far == num_images:
                    plt.show()
                    return


visualize_predictions(model, test_loader)
