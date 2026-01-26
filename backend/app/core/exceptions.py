from fastapi import HTTPException, status


class ShareNotFoundException(HTTPException):
    """Raised when a share is not found"""
    def __init__(self, share_code: str = None):
        detail = "Share not found"
        if share_code:
            detail = f"Share with code '{share_code}' not found"
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=detail
        )


class ShareExpiredException(HTTPException):
    """Raised when a share has expired"""
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_410_GONE,
            detail="Share has expired"
        )


class InvalidShareCodeException(HTTPException):
    """Raised when share code format is invalid"""
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid share code format"
        )


class PeerNotFoundException(HTTPException):
    """Raised when a peer is not found"""
    def __init__(self, peer_id: str = None):
        detail = "Peer not found"
        if peer_id:
            detail = f"Peer '{peer_id}' not found"
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=detail
        )


class FileNotFoundException(HTTPException):
    """Raised when a file is not found"""
    def __init__(self, file_id: str = None):
        detail = "File not found"
        if file_id:
            detail = f"File '{file_id}' not found"
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=detail
        )


class FileSizeExceededException(HTTPException):
    """Raised when file size exceeds limit"""
    def __init__(self, max_size_mb: int):
        super().__init__(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size exceeds maximum limit of {max_size_mb} MB"
        )
