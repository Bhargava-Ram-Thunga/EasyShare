# Quick Start Guide

Get the Easy Share backend running in 3 simple steps:

## Option 1: Using the run script (Recommended)

### macOS/Linux
```bash
./run.sh
```

### Windows
```bash
run.bat
```

## Option 2: Manual setup

### 1. Set up virtual environment
```bash
# Create virtual environment
python -m venv venv

# Activate it
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Run the server
```bash
python -m app.main
```

## Access the API

Once running, open your browser:

- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health
- **WebSocket Signaling**: ws://localhost:8000/ws/signaling

## Test the API

### Create a share
```bash
curl -X POST http://localhost:8000/api/shares/create \
  -H "Content-Type: application/json" \
  -d '{
    "files": [
      {"name": "test.txt", "size": 1024, "type": "text/plain"}
    ]
  }'
```

### Get share details
```bash
# Replace ABC123XYZ with the share code from the previous response
curl http://localhost:8000/api/shares/ABC123XYZ
```

## Troubleshooting

### Port already in use
If port 8000 is already in use, you can change it:
```bash
uvicorn app.main:app --reload --port 8080
```

### Module not found
Make sure you're in the backend directory and virtual environment is activated:
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

### Database errors
Delete the database file and restart:
```bash
rm easyshare.db
python -m app.main
```
