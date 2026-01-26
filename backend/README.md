# Easy Share Backend

Fast, secure, peer-to-peer file sharing API built with FastAPI.

## Features

- **Share Management**: Create and manage file share sessions with unique 9-digit codes
- **WebRTC Signaling**: Real-time peer connection establishment via WebSocket
- **Transfer Tracking**: Monitor file transfer progress and history
- **File Management**: View, manage, and track shared files
- **Session Management**: Automatic expiration and cleanup of old shares
- **Statistics**: Transfer history and usage statistics

## Tech Stack

- **FastAPI**: Modern, fast web framework
- **SQLAlchemy**: Async ORM for database operations
- **SQLite**: Lightweight database (easily switchable to PostgreSQL)
- **WebSockets**: Real-time signaling for WebRTC
- **Pydantic**: Data validation and settings management

## Setup

### Prerequisites

- Python 3.9+
- pip

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create environment file:
```bash
cp .env.example .env
```

5. Edit `.env` and update configuration as needed

### Running the Server

Development mode with auto-reload:
```bash
python -m app.main
```

Or using uvicorn directly:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: http://localhost:8000
- Interactive docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Shares

- `POST /api/shares/create` - Create a new share session
- `GET /api/shares/{share_code}` - Get share details
- `DELETE /api/shares/{share_code}` - Delete/cancel a share
- `POST /api/shares/cleanup` - Cleanup expired shares

### Peers

- `POST /api/peers/register` - Register a peer for a session
- `GET /api/peers/{peer_id}/status` - Get peer status
- `PUT /api/peers/{peer_id}/status` - Update peer status

### Files

- `GET /api/files` - Get file records
- `DELETE /api/files/{file_id}` - Delete a file record
- `PUT /api/files/{file_id}/progress` - Update file transfer progress

### History

- `GET /api/history` - Get transfer history
- `GET /api/history/stats` - Get transfer statistics

### WebSocket

- `WS /ws/signaling` - WebRTC signaling server

## WebRTC Signaling Protocol

Connect to `ws://localhost:8000/ws/signaling` and send:

1. **Join session**:
```json
{
  "type": "join",
  "peer_id": "unique-peer-id",
  "session_id": "session-id"
}
```

2. **Send WebRTC offer**:
```json
{
  "type": "offer",
  "target_peer_id": "receiver-peer-id",
  "sdp": "webrtc-sdp-offer"
}
```

3. **Send WebRTC answer**:
```json
{
  "type": "answer",
  "target_peer_id": "sender-peer-id",
  "sdp": "webrtc-sdp-answer"
}
```

4. **Exchange ICE candidates**:
```json
{
  "type": "ice_candidate",
  "target_peer_id": "other-peer-id",
  "candidate": "ice-candidate-data"
}
```

## Database Models

### Share
- Stores share session metadata
- Tracks share codes, expiration, and status
- Links to files and peer connections

### ShareFile
- Individual files within a share
- Tracks transfer progress and status

### TransferHistory
- Records completed transfers
- Stores transfer metrics and peer info

### PeerConnection
- Tracks peer connection states
- Links peers to share sessions

## Configuration

Edit `.env` file:

```env
DATABASE_URL=sqlite+aiosqlite:///./easyshare.db
SECRET_KEY=your-secret-key-here
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
SHARE_CODE_LENGTH=9
SHARE_EXPIRY_HOURS=24
MAX_FILE_SIZE_MB=1000
```

## Development

### Running Tests

```bash
pytest
```

### Database Migrations

The database is automatically created on startup. For production, consider using Alembic for migrations:

```bash
pip install alembic
alembic init alembic
```

### Code Style

Follow PEP 8 guidelines. Use black for formatting:

```bash
pip install black
black app/
```

## Production Deployment

1. Use PostgreSQL instead of SQLite
2. Set a strong `SECRET_KEY`
3. Configure proper CORS origins
4. Use a production ASGI server (uvicorn with gunicorn)
5. Set up HTTPS/TLS
6. Implement rate limiting
7. Add authentication if needed
8. Set up monitoring and logging

Example production command:
```bash
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## Architecture

```
backend/
├── app/
│   ├── api/          # API route handlers
│   ├── core/         # Core configuration
│   ├── db/           # Database setup
│   ├── models/       # SQLAlchemy models
│   ├── schemas/      # Pydantic schemas
│   ├── services/     # Business logic
│   └── main.py       # FastAPI application
├── requirements.txt  # Python dependencies
└── .env             # Environment variables
```

## License

MIT
