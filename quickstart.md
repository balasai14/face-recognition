# Quick Start Guide

## ✅ Installation Complete!

All dependencies have been installed successfully. Follow these steps to start the system.

## Prerequisites

Before starting, ensure you have:
- ✅ Node.js 18+ installed
- ✅ MongoDB running (or use Docker)
- ✅ Python 3.9+ (for ML services)

## Option 1: Quick Start with Docker (Recommended)

This is the easiest way to get everything running:

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Documentation: http://localhost:5000/api/docs

## Option 2: Manual Start (Development)

### Step 1: Start MongoDB

```bash
# If MongoDB is not running, start it
mongod --dbpath ./data/db

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:6
```

### Step 2: Configure Environment

```bash
# Copy environment file
cp backend/.env.example backend/.env

# Edit if needed (default values should work for local development)
```

### Step 3: Start Backend

```bash
cd backend
npm run dev
```

Backend will start on http://localhost:5000

### Step 4: Start Frontend

Open a new terminal:

```bash
cd frontend
npm run dev
```

Frontend will start on http://localhost:3000

### Step 5: Start ML Services (Optional for full functionality)

Open new terminals for each service:

**Individual Authentication Service:**
```bash
cd ml-services/individual_auth
pip install -r requirements.txt
python app.py
```

**Group Authentication Service:**
```bash
cd ml-services/group_auth
pip install -r requirements.txt
python app.py
```

**Crowd Counting Service:**
```bash
cd ml-services/crowd_counting
pip install -r requirements.txt
python app.py
```

## First Steps

### 1. Create an Account

Navigate to http://localhost:3000 and click "Register"

- Username: testuser
- Email: test@example.com
- Password: password123
- Role: user

### 2. Explore Features

**Individual Authentication:**
- Go to "Individual Auth" in the navigation
- Click "Register New Person" to add face profiles
- Upload 5+ images of a person
- Then try authenticating with a new image

**Group Authentication:**
- Go to "Group Auth"
- Upload a group photo
- Enter event details
- View identified attendees

**Crowd Counting:**
- Go to "Crowd Count"
- Upload a crowd image
- View face count and density heatmap

## Troubleshooting

### Backend won't start

**Check MongoDB connection:**
```bash
# Test MongoDB
mongo --eval "db.adminCommand('ping')"
```

**Check port availability:**
```bash
# Windows
netstat -ano | findstr :5000

# If port is in use, change PORT in backend/.env
```

### Frontend won't start

**Check if port 3000 is available:**
```bash
# Windows
netstat -ano | findstr :3000
```

**Clear cache and reinstall:**
```bash
cd frontend
rm -rf node_modules
npm install
```

### ML Services errors

**Install Python dependencies:**
```bash
cd ml-services
pip install -r requirements.txt
```

**Check Python version:**
```bash
python --version
# Should be 3.9 or higher
```

## Development Tips

### Hot Reload

Both frontend and backend support hot reload:
- Backend: Changes to `.js` files will restart the server automatically
- Frontend: Changes to `.jsx` files will update in the browser automatically

### API Testing

Use the Swagger UI for API testing:
- http://localhost:5000/api/docs

Or use curl:
```bash
# Health check
curl http://localhost:5000/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"pass123"}'
```

### Database Management

**View data in MongoDB:**
```bash
mongo face-recognition
db.users.find()
db.faceprofiles.find()
```

**Reset database:**
```bash
mongo face-recognition
db.dropDatabase()
```

## Next Steps

1. **Read the Documentation:**
   - API Documentation: `backend/src/docs/api-documentation.md`
   - Deployment Guide: `docs/deployment-guide.md`
   - Performance Guide: `docs/performance-optimization-guide.md`

2. **Configure for Production:**
   - Update JWT_SECRET in `.env`
   - Set up HTTPS
   - Configure backups
   - Enable monitoring

3. **Train ML Models:**
   - Prepare training datasets
   - Run training scripts in `ml-services/*/train.py`
   - Validate models with `ml-services/*/validate.py`

4. **Run Tests:**
   ```bash
   cd backend
   npm test
   ```

## Common Commands

```bash
# Install all dependencies
npm run install-all

# Start development (all services)
npm run dev

# Build for production
npm run build

# Run tests
npm test

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## Getting Help

- Check logs: `docker-compose logs` or `npm run dev`
- Review documentation in `/docs` folder
- Check API docs: http://localhost:5000/api/docs
- Review the spec: `.kiro/specs/face-recognition-crowd-analysis/`

## System Architecture

```
┌─────────────────┐
│  React Frontend │ :3000
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Express API    │ :5000
└────────┬────────┘
         │
    ┌────┴────┬──────────┬──────────┐
    ▼         ▼          ▼          ▼
┌────────┐ ┌────┐ ┌────────┐ ┌──────────┐
│MongoDB │ │ML  │ │ML      │ │ML Crowd  │
│        │ │Ind │ │Group   │ │Counting  │
└────────┘ └────┘ └────────┘ └──────────┘
           :5001   :5002      :5003
```

## Success!

Your Face Recognition and Crowd Analysis System is now ready to use! 🎉

Start exploring the features and building amazing applications with face recognition technology.
