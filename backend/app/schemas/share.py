from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum


class ConnectionStatus(str, Enum):
    WAITING = "waiting"
    CONNECTING = "connecting"
    CONNECTED = "connected"
    DISCONNECTED = "disconnected"
    FAILED = "failed"


class TransferStatus(str, Enum):
    PENDING = "pending"
    UPLOADING = "uploading"
    DOWNLOADING = "downloading"
    COMPLETED = "completed"
    ERROR = "error"


class ShareStatus(str, Enum):
    ACTIVE = "active"
    EXPIRED = "expired"
    DELETED = "deleted"
    COMPLETED = "completed"


class TransferType(str, Enum):
    SENT = "sent"
    RECEIVED = "received"


class FileItemCreate(BaseModel):
    name: str
    size: int
    type: str


class FileItemResponse(BaseModel):
    id: str
    name: str
    size: int
    type: str

    class Config:
        from_attributes = True


class TransferFileResponse(FileItemResponse):
    progress: float = 0.0
    status: TransferStatus = TransferStatus.PENDING
    speed: Optional[float] = None
    time_remaining: Optional[int] = None

    class Config:
        from_attributes = True


class ShareCreateRequest(BaseModel):
    files: List[FileItemCreate] = Field(..., min_length=1)
    password: Optional[str] = None


class PeerConnectionResponse(BaseModel):
    peer_id: str
    status: ConnectionStatus
    connected_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ShareCreateResponse(BaseModel):
    share_id: str
    share_code: str
    share_link: str
    session_id: str
    expires_at: datetime
    peer_id: str
    signaling_server: str = "ws://localhost:8000/ws/signaling"

    class Config:
        from_attributes = True


class ShareDetailResponse(BaseModel):
    id: str
    share_code: str
    session_id: str  # Added for WebRTC signaling
    files: List[FileItemResponse]
    total_size: int
    created_at: datetime
    expires_at: Optional[datetime]
    status: str
    access_count: int
    connection: Optional[PeerConnectionResponse] = None

    class Config:
        from_attributes = True


class FileRecordResponse(BaseModel):
    id: str
    name: str
    size: int
    type: str
    uploaded_at: datetime
    share_link: Optional[str] = None
    downloads: int = 0
    status: ShareStatus

    class Config:
        from_attributes = True


class TransferHistoryResponse(BaseModel):
    id: str
    type: TransferType
    file_name: str
    file_size: int
    timestamp: datetime
    peer: str
    status: str
    speed: Optional[str] = None

    class Config:
        from_attributes = True


class PeerRegisterRequest(BaseModel):
    share_code: str
    is_sender: bool = False


class PeerRegisterResponse(BaseModel):
    peer_id: str
    share_id: str
    session_id: str
    status: ConnectionStatus
    signaling_server: str = "ws://localhost:8000/ws/signaling"

    class Config:
        from_attributes = True


class UpdateProgressRequest(BaseModel):
    file_id: str
    progress: float
    speed: Optional[float] = None
    status: Optional[TransferStatus] = None


class TransferHistoryCreate(BaseModel):
    share_id: str
    transfer_type: TransferType
    file_name: str
    file_size: int
    peer_info: str = "Unknown"
    status: str = "completed"
    transfer_speed: Optional[str] = None
    duration_seconds: Optional[int] = None
