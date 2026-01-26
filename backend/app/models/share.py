from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Enum as SQLEnum, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
import enum
from app.db.database import Base


class ShareStatus(str, enum.Enum):
    ACTIVE = "active"
    EXPIRED = "expired"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    DELETED = "deleted"


class TransferStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class TransferType(str, enum.Enum):
    SENT = "sent"
    RECEIVED = "received"


class ConnectionStatus(str, enum.Enum):
    WAITING = "waiting"
    CONNECTING = "connecting"
    CONNECTED = "connected"
    DISCONNECTED = "disconnected"
    FAILED = "failed"


class Share(Base):
    __tablename__ = "shares"

    id = Column(String, primary_key=True, index=True)
    share_code = Column(String(9), unique=True, index=True, nullable=False)
    session_id = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime)
    status = Column(SQLEnum(ShareStatus), default=ShareStatus.ACTIVE)
    access_count = Column(Integer, default=0)
    sender_peer_id = Column(String)
    receiver_peer_id = Column(String, nullable=True)
    total_size = Column(Integer, default=0)
    is_password_protected = Column(Boolean, default=False)
    password_hash = Column(String, nullable=True)

    files = relationship("ShareFile", back_populates="share", cascade="all, delete-orphan")
    transfers = relationship("TransferHistory", back_populates="share")  # No cascade - preserve history
    peer_connections = relationship("PeerConnection", back_populates="share", cascade="all, delete-orphan")


class ShareFile(Base):
    __tablename__ = "share_files"

    id = Column(String, primary_key=True, index=True)
    share_id = Column(String, ForeignKey("shares.id", ondelete="CASCADE"))
    name = Column(String, nullable=False)
    size = Column(Integer, nullable=False)
    type = Column(String)
    progress = Column(Float, default=0.0)
    status = Column(SQLEnum(TransferStatus), default=TransferStatus.PENDING)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    share = relationship("Share", back_populates="files")


class TransferHistory(Base):
    __tablename__ = "transfer_history"

    id = Column(String, primary_key=True, index=True)
    share_id = Column(String, ForeignKey("shares.id", ondelete="SET NULL"), nullable=True)
    transfer_type = Column(SQLEnum(TransferType))
    file_name = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    peer_info = Column(String)
    status = Column(SQLEnum(TransferStatus))
    transfer_speed = Column(String, nullable=True)
    duration_seconds = Column(Integer, nullable=True)

    share = relationship("Share", back_populates="transfers")


class PeerConnection(Base):
    __tablename__ = "peer_connections"

    id = Column(String, primary_key=True, index=True)
    share_id = Column(String, ForeignKey("shares.id", ondelete="CASCADE"))
    peer_id = Column(String, unique=True, index=True, nullable=False)
    status = Column(SQLEnum(ConnectionStatus), default=ConnectionStatus.WAITING)
    connected_at = Column(DateTime, nullable=True)
    disconnected_at = Column(DateTime, nullable=True)
    is_sender = Column(Boolean, default=False)

    share = relationship("Share", back_populates="peer_connections")
