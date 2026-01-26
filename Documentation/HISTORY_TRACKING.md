# Transfer History - Implementation Guide

## Overview

The Easy Share application includes comprehensive transfer history tracking that preserves all sent and received file transfer records, even when files or shares are deleted.

## Key Features

### 1. **Permanent History Storage**
- All file transfers are logged automatically
- History records are **NEVER deleted** from the database
- Even when shares are hard-deleted, transfer history remains intact
- Provides a complete audit trail of all file sharing activity

### 2. **Transfer Tracking**
History is automatically recorded when:
- **Sender**: File transfer completes via WebRTC
- **Receiver**: File download completes successfully

Each record includes:
- File name and size
- Transfer type (sent/received)
- Timestamp
- Peer information
- Transfer status (completed/failed)
- Transfer speed (optional)
- Duration (optional)

### 3. **History Page Features**
- **Statistics Dashboard**:
  - Total data sent
  - Total data received
  - Total transfer count

- **Activity Filters**:
  - All Activity (default)
  - Sent only
  - Received only

- **No Delete Option**: History cannot be deleted through the UI (by design)

## Database Schema

### TransferHistory Model
```python
class TransferHistory(Base):
    __tablename__ = "transfer_history"

    id = Column(String, primary_key=True)
    share_id = Column(String, ForeignKey("shares.id", ondelete="SET NULL"), nullable=True)
    transfer_type = Column(SQLEnum(TransferType))  # SENT or RECEIVED
    file_name = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    peer_info = Column(String)
    status = Column(SQLEnum(TransferStatus))
    transfer_speed = Column(String, nullable=True)
    duration_seconds = Column(Integer, nullable=True)
```

### Important Schema Design
- `share_id` is **nullable** with `ondelete="SET NULL"`
- When a share is deleted, `share_id` becomes `NULL` but the record remains
- No CASCADE delete on history records
- Ensures complete transfer history is preserved

## Migration Required

If you have an existing database, you need to run the migration script:

```bash
cd backend
python migrate_history.py
```

This will:
1. Update the `transfer_history` table schema
2. Make `share_id` nullable
3. Change foreign key constraint to `ON DELETE SET NULL`
4. Preserve all existing history records

## API Endpoints

### Get Transfer History
```
GET /api/history?limit=50&offset=0
```
Returns list of transfer records with pagination.

### Get Transfer Statistics
```
GET /api/history/stats
```
Returns aggregate statistics:
```json
{
  "total_sent": {
    "count": 10,
    "bytes": 5242880
  },
  "total_received": {
    "count": 5,
    "bytes": 2097152
  },
  "total_transfers": 15
}
```

### Create Transfer History Record
```
POST /api/history
```
Request body:
```json
{
  "share_id": "uuid",
  "transfer_type": "sent",  // or "received"
  "file_name": "example.pdf",
  "file_size": 1024000,
  "peer_info": "peer-12345",
  "status": "completed",
  "transfer_speed": "5.2 MB/s",  // optional
  "duration_seconds": 10  // optional
}
```

## Implementation Details

### Automatic Recording - Sender Side

In `SharePage.tsx`, after each file is sent:
```typescript
await webrtc.sendFile(file);
const durationSeconds = Math.floor((endTime - startTime) / 1000);

await apiService.createTransferHistory({
  share_id: shareData.share_id,
  transfer_type: "sent",
  file_name: file.name,
  file_size: file.size,
  peer_info: remotePeerIdRef.current || "Unknown",
  status: "completed",
  duration_seconds: durationSeconds,
});
```

### Automatic Recording - Receiver Side

In `ReceivePage.tsx`, when file download completes:
```typescript
webrtc.onComplete(async (fileId, blob) => {
  // Download file to user's device
  // ...

  await apiService.createTransferHistory({
    share_id: shareDetails.id,
    transfer_type: "received",
    file_name: fileMetadata.name,
    file_size: fileMetadata.size,
    peer_info: shareDetails.connection?.peer_id || "Unknown",
    status: "completed",
  });
});
```

## File Deletion Behavior

### Soft Delete (Active → Expired)
- Share status changes to `EXPIRED`
- Files disappear from Active tab
- Files appear in Expired tab
- **History remains intact with original share_id**

### Hard Delete (Expired → Permanently Deleted)
- Share and files are permanently removed from database
- `share_id` in history records becomes `NULL`
- **History records remain in the database**
- All file metadata (name, size, timestamp) is preserved

## Privacy Considerations

### Data Retention
- Transfer history is stored indefinitely
- No automatic cleanup of old records
- Provides complete audit trail

### Manual Cleanup (If Needed)
If you need to manually clean up old history records:

```sql
-- Delete history older than 90 days (example)
DELETE FROM transfer_history
WHERE timestamp < datetime('now', '-90 days');

-- Or delete all history for a specific share
DELETE FROM transfer_history
WHERE share_id = 'specific-share-id';
```

⚠️ **Warning**: Manual database modifications should be done with caution and proper backups.

## Testing History Tracking

### Test Scenario 1: Normal Transfer
1. Upload files and create a share
2. Open receive page with share code
3. Select and download files
4. Check History page - should show:
   - Sent record (on sender's history)
   - Received record (on receiver's history)
   - Updated statistics

### Test Scenario 2: Delete Active File
1. Create and complete a transfer
2. Verify history exists
3. Delete file from Active tab (soft delete)
4. Check History page - record still exists
5. Check database - share_id still present

### Test Scenario 3: Delete Expired File
1. Delete file from Expired tab (hard delete)
2. Check History page - record still exists
3. Check database - share_id is NULL but record remains

## Troubleshooting

### History Not Recording
Check that:
1. WebRTC transfer completed successfully
2. No errors in browser console during transfer
3. Backend is running and accessible
4. Database connection is working

### History Disappeared After Delete
This shouldn't happen! If it does:
1. Check database schema - ensure migration was run
2. Verify foreign key constraint is `ON DELETE SET NULL`
3. Check for cascade delete in relationship definitions

### Statistics Not Updating
1. History records must have status = "completed"
2. Failed transfers are not included in statistics
3. Refresh the History page to see latest stats

## Future Enhancements

Potential additions to consider:
- Export history to CSV/JSON
- Search/filter history by file name or date range
- Configurable data retention policy
- History cleanup scheduler
- Transfer speed charts and analytics
- Notification when history reaches certain thresholds
