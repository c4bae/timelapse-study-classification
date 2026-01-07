# StudyLapse

<p align="center">
  <kbd>
    <img width="1469" height="745" alt="Screenshot 2026-01-06 at 5 03 44 PM" src="https://github.com/user-attachments/assets/b02eae10-f28e-478e-a612-d34ddb0c6e4f" />
  </kbd>
</p>

<p align="center">
  <kbd>
    <img width="1460" height="745" alt="Screenshot 2026-01-06 at 9 18 31 PM" src="https://github.com/user-attachments/assets/6b0082d6-5d92-4d06-a8f9-0582aa217728" />
  </kbd>
</p>

<p align="center">
  <kbd>
    <img width="581" height="745" alt="Screenshot 2026-01-06 at 9 16 14 PM" src="https://github.com/user-attachments/assets/565cbcca-df0c-47f2-9d80-2c6e9d21893e" />
  </kbd>
</p>

StudyLapse is a full-stack application for analyzing timelapse videos of study sessions using AI to track study habits. It automatically detects when users are focused, absent from their study area, or using their phone, providing detailed analytics and insights through an interactive video player with timestamped highlights.

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Framer Motion, React Router
- **Backend:** Python, FastAPI, Express.js, PyTorch, OpenCV, Ultralytics YOLO
- **AI Models:** YOLOv8 (object detection), Custom PyTorch CNN (phone usage classification)
- **Database:** Supabase (PostgreSQL)
- **Storage:** AWS S3
- **Authentication:** Clerk
- **Communication:** REST APIs

---

## Architecture

```
frontend/
  ├── src/
  │   ├── components/       # React components for UI and video player
  │   │   └── ui/          # Reusable UI components
  │   ├── pages/           # Page components (Dashboard, Videos, Settings)
  │   ├── config/          # Supabase client configuration
  │   └── main.tsx         # App entry point
  └── public/              # Static assets
backend/
  ├── main.py              # FastAPI server for video processing (AI inference)
  ├── server.js            # Express.js server for uploads and webhooks
  ├── train.py             # Model training script
  ├── model_arch.py        # PyTorch model architecture
  └── models/              # AI model files
      ├── timelapse_model.pth  # Custom phone detection model
      └── yolov8n.pt       # YOLOv8 for person detection
```

### System Overview

```
                    ┌─────────────────┐
                    │    Frontend     │
                    │ React + Vite    │
                    │   (Port 5173)   │
                    └────────┬────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
        ┌───────▼────────┐       ┌────────▼────────┐
        │  Express.js    │       │    FastAPI      │
        │  (Port 3000)   │       │   (Port 8000)   │
        │                │       │                 │
        │ - Uploads      │       │ - AI Processing │
        │ - Webhooks     │       │ - Frame Extract │
        │ - Media URLs   │       │ - YOLOv8        │
        │                │       │ - PyTorch Model │
        └───────┬────────┘       └────────┬────────┘
                │                         │
                └────────────┬────────────┘
                             │
                    ┌────────▼────────┐
                    │  Supabase DB    │
                    │  (PostgreSQL)   │
                    │                 │
                    │ - User data     │
                    │ - Video metadata│
                    │ - Statistics    │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │    AWS S3       │
                    │                 │
                    │ - Videos        │
                    │ - Thumbnails    │
                    └─────────────────┘
```

- **Frontend** uses React with TypeScript for the UI, displaying video analytics and an interactive player with timestamped highlights.
- **Express.js Server** handles video uploads to S3, Clerk webhooks, and generates signed URLs for media access.
- **FastAPI Server** processes videos using AI models: extracts frames, detects presence/absence with YOLOv8, and classifies phone usage with a custom PyTorch model.
- **Supabase** stores user data, video metadata, and aggregated statistics.
- **AWS S3** stores video files and thumbnails securely.

---

## AI Models

### YOLOv8 (Ultralytics)
- **Purpose:** Object detection for identifying presence/absence
- **Input:** Video frames (every 8th frame sampled)
- **Output:** Bounding boxes for detected people
- **Usage:** Determines if a person is present in the frame (absence detection)
- **Model:** Pre-trained `yolov8n.pt` (nano variant for speed)

### Custom StudyHabitClassifier (PyTorch)
- **Purpose:** Binary classification of phone usage vs. studying
- **Architecture:** Convolutional Neural Network (CNN) based on ResNet
- **Input:** Preprocessed video frames (256x256, normalized)
- **Output:** Binary classification (0 = phone usage, 1 = studying)
- **Training:** Custom dataset with labeled frames of studying vs. phone usage

### Processing Pipeline
1. **Frame Extraction:** Extract every 8th frame from video with exact timestamps
2. **Absence Detection:** YOLOv8 checks for person presence in each frame
3. **Phone Detection:** Custom CNN classifies remaining frames for phone usage
4. **Timestamp Mapping:** Map detections to exact video timestamps
5. **Statistics Calculation:** Compute focus, absent, and phone usage percentages

---

## Key Files & Folders

- `frontend/src/components/ui/videos-grid.tsx` — Video grid and player with timestamp highlights
- `frontend/src/pages/Dashboard.tsx` — Analytics dashboard with statistics
- `backend/main.py` — FastAPI server with video processing pipeline
- `backend/server.js` — Express.js server for uploads and webhooks
- `backend/train.py` — Model training script
- `backend/model_arch.py` — PyTorch model architecture definition
- `backend/models/` — AI model files (YOLOv8 and custom CNN)
- `requirements.txt` — Python dependencies
- `package.json` — Node.js dependencies

---

## Features

- **AI-Powered Video Analysis:** Automatic detection of focus, absence, and phone usage using YOLOv8 and custom PyTorch models
- **Interactive Video Player:** Custom player with color-coded progress bar highlighting absent (red) and phone usage (yellow) moments
- **Timestamp Mapping:** Exact timestamps for each detection event stored in JSONB format
- **Analytics Dashboard:** Track study habits over time with visual statistics and charts
- **Class Organization:** Assign and filter videos by class name for subject-specific tracking
- **Real-time Processing:** Background task processing with FastAPI for non-blocking video analysis
- **Secure Storage:** AWS S3 integration with signed URLs for secure media access
- **User Authentication:** Clerk integration for secure user management

---

## API Endpoints

### Express.js Server (Port 3000)
- `POST /api/upload` — Upload video file to S3
- `POST /api/webhooks` — Clerk webhook handler for user creation
- `POST /api/media` — Generate signed URLs for S3 media

### FastAPI Server (Port 8000)
- `POST /api/process` — Process video and analyze study habits
  - Request: `{ user_id: string, video_name: string, class_name?: string }`
  - Response: `"Payload received"` (processing runs in background)

---

## Video Processing Flow

1. **Upload:** User uploads timelapse video through frontend
2. **Storage:** Video uploaded to AWS S3 via Express.js
3. **Processing Request:** Express.js sends request to FastAPI
4. **Frame Extraction:** FastAPI downloads video, extracts frames (every 8th frame) with timestamps
5. **Absence Detection:** YOLOv8 detects person presence in frames
6. **Phone Detection:** Custom PyTorch model classifies phone usage in remaining frames
7. **Timestamp Mapping:** Each detection mapped to exact video timestamp
8. **Database Update:** Results stored in Supabase with percentages and timestamp arrays

---

## Note

The Supabase database schema and the trained PyTorch model (`timelapse_model.pth`) are not provided in this repository. You will need to:
- Set up your own Supabase database with the required tables
- Train your own model using `backend/train.py` or provide a pre-trained model
