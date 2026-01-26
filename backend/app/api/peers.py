from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.schemas.share import (
    PeerRegisterRequest,
    PeerRegisterResponse,
    ConnectionStatus,
)
from app.services import share_service
from app.models.share import ConnectionStatus as DBConnectionStatus

router = APIRouter()


@router.post("/register", response_model=PeerRegisterResponse, status_code=status.HTTP_201_CREATED)
async def register_peer(
    request: PeerRegisterRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Register a peer for a share session

    - Validates share code
    - Creates peer connection
    - Returns peer ID and signaling server info
    """
    result = await share_service.register_peer(
        db,
        request.share_code,
        request.is_sender
    )

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Share not found or expired"
        )

    share, peer = result

    return PeerRegisterResponse(
        peer_id=peer.peer_id,
        share_id=share.id,
        session_id=share.session_id,
        status=ConnectionStatus.WAITING,
        signaling_server="ws://localhost:8000/ws/signaling"
    )


@router.get("/{peer_id}/status")
async def get_peer_status(
    peer_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get peer connection status
    """
    from sqlalchemy import select
    from app.models.share import PeerConnection

    result = await db.execute(
        select(PeerConnection).where(PeerConnection.peer_id == peer_id)
    )
    peer = result.scalar_one_or_none()

    if not peer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Peer not found"
        )

    return {
        "peer_id": peer.peer_id,
        "status": peer.status.value,
        "connected_at": peer.connected_at,
        "is_sender": peer.is_sender
    }


@router.put("/{peer_id}/status")
async def update_peer_status(
    peer_id: str,
    status: ConnectionStatus,
    db: AsyncSession = Depends(get_db)
):
    """
    Update peer connection status
    """
    # Map schema status to DB status
    db_status = DBConnectionStatus(status.value)

    peer = await share_service.update_peer_status(db, peer_id, db_status)

    if not peer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Peer not found"
        )

    return {
        "peer_id": peer.peer_id,
        "status": peer.status.value,
        "updated": True
    }
