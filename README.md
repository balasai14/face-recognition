# Multi-Level Face Recognition and Crowd Analysis System

A comprehensive face recognition and crowd analysis system built with MERN stack and deep learning.

## Features

- **Individual Person Authentication**: CNN-based face recognition for secure access control
- **Group Authentication**: MTCNN + FaceNet/ArcFace for multi-person identification
- **Large Gathering Face Counting**: YOLO + MCNN for real-time crowd analysis

## Tech Stack

- **Frontend**: React 18, Material-UI, Vite
- **Backend**: Node.js, Express.js, MongoDB
- **ML Services**: Python, TensorFlow, PyTorch, Flask
- **Deep Learning**: CNN, MTCNN, FaceNet, YOLO, MCNN

## Project Structure

```
├── backend/          # Express.js API server
├── frontend/         # React application
├── ml-services/      # Python ML microservices
│   ├── individual_auth/
│   ├── group_auth/
│   └── crowd_counting/
└── docker-compose.yml
```

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.9+
- MongoDB 6+
- Docker (optional)

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm run install-all
```

3. Set up environment variables:
```bash
cp backend/.env.example backend/.env
```

4. Install Python dependencies:
```bash
cd ml-services
pip install -r requirements.txt
```

### Running with Docker

```bash
docker-compose up
```

### Running Locally

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev

# Terminal 3 - ML Services
cd ml-services/individual_auth
python app.py
```

## API Documentation

API documentation will be available at `/api/docs` once the server is running.

## License

MIT
