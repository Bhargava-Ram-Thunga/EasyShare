from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.db.database import get_db
from app.schemas.share import (
    FileRecordResponse,
    UpdateProgressRequest,
    TransferFileResponse,
)
from app.services import share_service
from app.models.share import ShareStatus
from app.core.config import settings

router = APIRouter()


@router.get("", response_model=List[FileRecordResponse])
async def get_files(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    status_filter: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Get user's file records

    - Returns list of shared files
    - Supports pagination
    - Can filter by status
    """
    # Parse status filter
    db_status = None
    if status_filter:
        try:
            db_status = ShareStatus(status_filter)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status: {status_filter}"
            )

    records = await share_service.get_file_records(db, limit, offset, db_status)

    # Transform to response format
    file_records = []
    for share, files in records:
        for file in files:
            share_link = f"{settings.FRONTEND_URL}/receive?code={share.share_code}"

            file_records.append(
                FileRecordResponse(
                    id=file.id,
                    name=file.name,
                    size=file.size,
                    type=file.type,
                    uploaded_at=file.uploaded_at,
                    share_link=share_link if share.status == ShareStatus.ACTIVE else None,
                    downloads=share.access_count,
                    status=share.status
                )
            )

    return file_records


@router.delete("/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_file(
    file_id: str,
    hard_delete: bool = Query(False, description="If true, permanently delete. If false, mark as expired."),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a file record

    - hard_delete=false (default): Marks share as EXPIRED (soft delete)
    - hard_delete=true: Permanently removes from database (hard delete)
    """
    from sqlalchemy import select
    from app.models.share import ShareFile

    result = await db.execute(
        select(ShareFile).where(ShareFile.id == file_id)
    )
    file = result.scalar_one_or_none()

    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )

    # Delete the associated share (soft or hard)
    await share_service.delete_share(db, file.share_id, hard_delete=hard_delete)

    return None


@router.put("/{file_id}/progress", response_model=TransferFileResponse)
async def update_file_progress(
    file_id: str,
    progress_data: UpdateProgressRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Update file transfer progress

    - Updates progress percentage
    - Updates transfer status
    - Tracks transfer speed
    """
    file = await share_service.update_file_progress(
        db,
        file_id,
        progress_data.progress,
        progress_data.status,
        progress_data.speed
    )

    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )

    # Calculate time remaining if speed is available
    time_remaining = None
    if progress_data.speed and progress_data.speed > 0:
        remaining_bytes = file.size * (1 - progress_data.progress / 100)
        time_remaining = int(remaining_bytes / progress_data.speed)

    return TransferFileResponse(
        id=file.id,
        name=file.name,
        size=file.size,
        type=file.type,
        progress=file.progress,
        status=file.status,
        speed=progress_data.speed,
        time_remaining=time_remaining
    )
