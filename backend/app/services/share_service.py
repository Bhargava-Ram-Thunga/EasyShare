from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from datetime import datetime, timedelta
import secrets
import string
from typing import List, Optional
import uuid

from app.models.share import Share, ShareFile, TransferHistory, PeerConnection
from app.models.share import ShareStatus, TransferStatus, ConnectionStatus, TransferType
from app.schemas.share import FileItemCreate, ShareCreateRequest
from app.core.config import settings


def generate_share_code(length: int = 9) -> str:
    """Generate a random alphanumeric share code"""
    characters = string.ascii_uppercase + string.digits
    # Exclude confusing characters
    characters = characters.replace('O', '').replace('0', '').replace('I', '').replace('1', '')
    return ''.join(secrets.choice(characters) for _ in range(length))


async def create_share(
    db: AsyncSession,
    share_request: ShareCreateRequest
) -> Share:
    """Create a new share session"""

    # Generate unique share code
    share_code = generate_share_code(settings.SHARE_CODE_LENGTH)

    # Check if code already exists (very unlikely but possible)
    while await get_share_by_code(db, share_code):
        share_code = generate_share_code(settings.SHARE_CODE_LENGTH)

    # Calculate total size
    total_size = sum(file.size for file in share_request.files)

    # Create share
    share = Share(
        id=str(uuid.uuid4()),
        share_code=share_code,
        session_id=str(uuid.uuid4()),
        expires_at=datetime.utcnow() + timedelta(hours=settings.SHARE_EXPIRY_HOURS),
        total_size=total_size,
        sender_peer_id=str(uuid.uuid4()),
        status=ShareStatus.ACTIVE
    )

    db.add(share)

    # Create file records
    for file_data in share_request.files:
        share_file = ShareFile(
            id=str(uuid.uuid4()),
            share_id=share.id,
            name=file_data.name,
            size=file_data.size,
            type=file_data.type,
            status=TransferStatus.PENDING
        )
        db.add(share_file)

    # Create sender peer connection
    sender_peer = PeerConnection(
        id=str(uuid.uuid4()),
        share_id=share.id,
        peer_id=share.sender_peer_id,
        status=ConnectionStatus.WAITING,
        is_sender=True
    )
    db.add(sender_peer)

    await db.commit()
    await db.refresh(share)

    return share


async def get_share_by_code(db: AsyncSession, share_code: str) -> Optional[Share]:
    """Get share by share code"""
    result = await db.execute(
        select(Share).where(Share.share_code == share_code)
    )
    return result.scalar_one_or_none()


async def get_share_by_id(db: AsyncSession, share_id: str) -> Optional[Share]:
    """Get share by ID"""
    result = await db.execute(
        select(Share).where(Share.id == share_id)
    )
    return result.scalar_one_or_none()


async def validate_share_code(
    db: AsyncSession,
    share_code: str
) -> Optional[Share]:
    """Validate share code without incrementing access count"""
    share = await get_share_by_code(db, share_code)

    if not share:
        return None

    # Check if expired
    if share.expires_at and share.expires_at < datetime.utcnow():
        share.status = ShareStatus.EXPIRED
        await db.commit()
        return None

    if share.status != ShareStatus.ACTIVE:
        return None

    return share


async def validate_and_access_share(
    db: AsyncSession,
    share_code: str
) -> Optional[Share]:
    """Validate share code and increment access count (use when actually connecting/downloading)"""
    share = await validate_share_code(db, share_code)

    if not share:
        return None

    # Increment access count only when actually accessing
    share.access_count += 1
    await db.commit()
    await db.refresh(share)

    return share


async def register_peer(
    db: AsyncSession,
    share_code: str,
    is_sender: bool = False
) -> Optional[tuple[Share, PeerConnection]]:
    """Register a peer for a share session"""
    share = await validate_and_access_share(db, share_code)

    if not share:
        return None

    # Create peer connection
    peer = PeerConnection(
        id=str(uuid.uuid4()),
        share_id=share.id,
        peer_id=str(uuid.uuid4()),
        status=ConnectionStatus.WAITING,
        is_sender=is_sender
    )

    if not is_sender:
        share.receiver_peer_id = peer.peer_id

    db.add(peer)
    await db.commit()
    await db.refresh(peer)

    return share, peer


async def update_peer_status(
    db: AsyncSession,
    peer_id: str,
    status: ConnectionStatus
) -> Optional[PeerConnection]:
    """Update peer connection status"""
    result = await db.execute(
        select(PeerConnection).where(PeerConnection.peer_id == peer_id)
    )
    peer = result.scalar_one_or_none()

    if not peer:
        return None

    peer.status = status

    if status == ConnectionStatus.CONNECTED:
        peer.connected_at = datetime.utcnow()
    elif status == ConnectionStatus.DISCONNECTED:
        peer.disconnected_at = datetime.utcnow()

    await db.commit()
    await db.refresh(peer)

    return peer


async def get_share_files(db: AsyncSession, share_id: str) -> List[ShareFile]:
    """Get all files for a share"""
    result = await db.execute(
        select(ShareFile).where(ShareFile.share_id == share_id)
    )
    return list(result.scalars().all())


async def update_file_progress(
    db: AsyncSession,
    file_id: str,
    progress: float,
    status: Optional[TransferStatus] = None,
    speed: Optional[float] = None
) -> Optional[ShareFile]:
    """Update file transfer progress"""
    result = await db.execute(
        select(ShareFile).where(ShareFile.id == file_id)
    )
    file = result.scalar_one_or_none()

    if not file:
        return None

    file.progress = progress
    if status:
        file.status = status

    await db.commit()
    await db.refresh(file)

    return file


async def create_transfer_history(
    db: AsyncSession,
    share_id: str,
    transfer_type: TransferType,
    file_name: str,
    file_size: int,
    peer_info: str,
    status: TransferStatus,
    transfer_speed: Optional[str] = None,
    duration_seconds: Optional[int] = None
) -> TransferHistory:
    """Create a transfer history record"""
    transfer = TransferHistory(
        id=str(uuid.uuid4()),
        share_id=share_id,
        transfer_type=transfer_type,
        file_name=file_name,
        file_size=file_size,
        peer_info=peer_info,
        status=status,
        transfer_speed=transfer_speed,
        duration_seconds=duration_seconds
    )

    db.add(transfer)
    await db.commit()
    await db.refresh(transfer)

    return transfer


async def get_transfer_history(
    db: AsyncSession,
    limit: int = 50,
    offset: int = 0
) -> List[TransferHistory]:
    """Get transfer history"""
    result = await db.execute(
        select(TransferHistory)
        .order_by(TransferHistory.timestamp.desc())
        .limit(limit)
        .offset(offset)
    )
    return list(result.scalars().all())


async def get_file_records(
    db: AsyncSession,
    limit: int = 50,
    offset: int = 0,
    status_filter: Optional[ShareStatus] = None
) -> List[tuple[Share, List[ShareFile]]]:
    """Get file records with their shares"""
    query = select(Share).order_by(Share.created_at.desc())

    if status_filter:
        query = query.where(Share.status == status_filter)
    # Note: When no filter, show all files (active, expired, etc.)
    # We keep deleted shares in DB but don't show them in UI

    query = query.limit(limit).offset(offset)

    result = await db.execute(query)
    shares = list(result.scalars().all())

    # Get files for each share
    records = []
    for share in shares:
        files = await get_share_files(db, share.id)
        records.append((share, files))

    return records


async def add_files_to_share(
    db: AsyncSession,
    share_id: str,
    files: List[FileItemCreate]
) -> List[ShareFile]:
    """Add files to an existing share"""
    share = await get_share_by_id(db, share_id)

    if not share:
        return []

    new_files = []
    additional_size = 0

    for file_data in files:
        share_file = ShareFile(
            id=str(uuid.uuid4()),
            share_id=share.id,
            name=file_data.name,
            size=file_data.size,
            type=file_data.type,
            status=TransferStatus.PENDING
        )
        db.add(share_file)
        new_files.append(share_file)
        additional_size += file_data.size

    # Update total size
    share.total_size += additional_size

    await db.commit()

    for file in new_files:
        await db.refresh(file)

    return new_files


async def delete_share(db: AsyncSession, share_id: str, hard_delete: bool = False) -> bool:
    """
    Delete a share

    Args:
        db: Database session
        share_id: Share ID
        hard_delete: If True, permanently delete from DB. If False, mark as EXPIRED.

    Returns:
        True if successful, False if share not found
    """
    share = await get_share_by_id(db, share_id)

    if not share:
        return False

    if hard_delete:
        # Permanently delete from database
        await db.delete(share)
    else:
        # Mark as expired (soft delete) so it shows up in expired tab
        share.status = ShareStatus.EXPIRED

    await db.commit()

    return True


async def cleanup_expired_shares(db: AsyncSession) -> int:
    """Clean up expired shares"""
    result = await db.execute(
        select(Share).where(
            and_(
                Share.expires_at < datetime.utcnow(),
                Share.status == ShareStatus.ACTIVE
            )
        )
    )
    shares = list(result.scalars().all())

    for share in shares:
        share.status = ShareStatus.EXPIRED

    await db.commit()

    return len(shares)
