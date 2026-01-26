from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.db.database import get_db
from app.schemas.share import (
    ShareCreateRequest,
    ShareCreateResponse,
    ShareDetailResponse,
    FileItemResponse,
    PeerConnectionResponse,
)
from app.services import share_service
from app.core.config import settings

router = APIRouter()


@router.post("/create", response_model=ShareCreateResponse, status_code=status.HTTP_201_CREATED)
async def create_share(
    share_request: ShareCreateRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new share session

    - Generates unique 9-digit share code
    - Creates file records
    - Returns share details and peer connection info
    """
    share = await share_service.create_share(db, share_request)

    # Build share link using configured frontend URL
    share_link = f"{settings.FRONTEND_URL}/receive?code={share.share_code}"

    return ShareCreateResponse(
        share_id=share.id,
        share_code=share.share_code,
        share_link=share_link,
        session_id=share.session_id,
        expires_at=share.expires_at,
        peer_id=share.sender_peer_id,
        signaling_server="ws://localhost:8000/ws/signaling"
    )


@router.get("/{share_code}", response_model=ShareDetailResponse)
async def get_share_details(
    share_code: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get share details by share code

    - Validates share code
    - Checks expiration
    - Returns file list and metadata
    - Does NOT increment access count (only viewing details)
    """
    share = await share_service.validate_share_code(db, share_code)

    if not share:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Share not found or expired"
        )

    # Get files
    files = await share_service.get_share_files(db, share.id)

    # Get peer connections
    file_items = [
        FileItemResponse(
            id=f.id,
            name=f.name,
            size=f.size,
            type=f.type
        )
        for f in files
    ]

    return ShareDetailResponse(
        id=share.id,
        share_code=share.share_code,
        session_id=share.session_id,
        files=file_items,
        total_size=share.total_size,
        created_at=share.created_at,
        expires_at=share.expires_at,
        status=share.status.value,
        access_count=share.access_count
    )


@router.delete("/{share_code}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_share(
    share_code: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Delete/cancel a share session
    """
    share = await share_service.get_share_by_code(db, share_code)

    if not share:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Share not found"
        )

    await share_service.delete_share(db, share.id)

    return None


@router.post("/{share_code}/add-files", response_model=ShareDetailResponse)
async def add_files_to_share(
    share_code: str,
    files_request: ShareCreateRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Add files to an existing share session
    """
    share = await share_service.get_share_by_code(db, share_code)

    if not share:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Share not found"
        )

    if share.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot add files to inactive share"
        )

    # Add new files to the share
    added_files = await share_service.add_files_to_share(db, share.id, files_request.files)

    # Get all files for the share
    all_files = await share_service.get_share_files(db, share.id)

    file_items = [
        FileItemResponse(
            id=f.id,
            name=f.name,
            size=f.size,
            type=f.type
        )
        for f in all_files
    ]

    return ShareDetailResponse(
        id=share.id,
        share_code=share.share_code,
        session_id=share.session_id,
        files=file_items,
        total_size=share.total_size,
        created_at=share.created_at,
        expires_at=share.expires_at,
        status=share.status.value,
        access_count=share.access_count
    )


@router.post("/cleanup")
async def cleanup_expired_shares(db: AsyncSession = Depends(get_db)):
    """
    Cleanup expired shares (admin/maintenance endpoint)
    """
    count = await share_service.cleanup_expired_shares(db)
    return {"cleaned_up": count}
