from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.db.database import get_db
from app.schemas.share import TransferHistoryResponse, TransferHistoryCreate
from app.services import share_service
from app.models.share import TransferType, TransferStatus

router = APIRouter()


@router.get("", response_model=List[TransferHistoryResponse])
async def get_transfer_history(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db)
):
    """
    Get transfer history

    - Returns list of completed transfers
    - Includes sent and received transfers
    - Supports pagination
    """
    history = await share_service.get_transfer_history(db, limit, offset)

    return [
        TransferHistoryResponse(
            id=record.id,
            type=record.transfer_type,
            file_name=record.file_name,
            file_size=record.file_size,
            timestamp=record.timestamp,
            peer=record.peer_info or "Unknown",
            status=record.status.value,
            speed=record.transfer_speed
        )
        for record in history
    ]


@router.get("/stats")
async def get_transfer_stats(
    db: AsyncSession = Depends(get_db)
):
    """
    Get transfer statistics

    - Total files sent/received
    - Total data transferred
    - Average transfer speed
    """
    from sqlalchemy import select, func
    from app.models.share import TransferHistory, TransferType, TransferStatus

    # Get sent stats
    sent_result = await db.execute(
        select(
            func.count(TransferHistory.id),
            func.sum(TransferHistory.file_size)
        ).where(
            TransferHistory.transfer_type == TransferType.SENT,
            TransferHistory.status == TransferStatus.COMPLETED
        )
    )
    sent_count, sent_bytes = sent_result.one()

    # Get received stats
    received_result = await db.execute(
        select(
            func.count(TransferHistory.id),
            func.sum(TransferHistory.file_size)
        ).where(
            TransferHistory.transfer_type == TransferType.RECEIVED,
            TransferHistory.status == TransferStatus.COMPLETED
        )
    )
    received_count, received_bytes = received_result.one()

    return {
        "total_sent": {
            "count": sent_count or 0,
            "bytes": sent_bytes or 0
        },
        "total_received": {
            "count": received_count or 0,
            "bytes": received_bytes or 0
        },
        "total_transfers": (sent_count or 0) + (received_count or 0)
    }


@router.post("", response_model=TransferHistoryResponse, status_code=status.HTTP_201_CREATED)
async def create_transfer_record(
    transfer_data: TransferHistoryCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a transfer history record

    - Used to log completed file transfers
    - Records both sent and received transfers
    """
    # Convert string transfer_type to enum
    transfer_type = TransferType.SENT if transfer_data.transfer_type == TransferType.SENT else TransferType.RECEIVED

    # Convert status string to enum
    status_enum = TransferStatus.COMPLETED if transfer_data.status == "completed" else TransferStatus.FAILED

    transfer = await share_service.create_transfer_history(
        db=db,
        share_id=transfer_data.share_id,
        transfer_type=transfer_type,
        file_name=transfer_data.file_name,
        file_size=transfer_data.file_size,
        peer_info=transfer_data.peer_info,
        status=status_enum,
        transfer_speed=transfer_data.transfer_speed,
        duration_seconds=transfer_data.duration_seconds
    )

    return TransferHistoryResponse(
        id=transfer.id,
        type=transfer.transfer_type,
        file_name=transfer.file_name,
        file_size=transfer.file_size,
        timestamp=transfer.timestamp,
        peer=transfer.peer_info or "Unknown",
        status=transfer.status.value,
        speed=transfer.transfer_speed
    )
