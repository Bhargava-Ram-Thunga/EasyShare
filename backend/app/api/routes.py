from fastapi import APIRouter
from app.api import shares, peers, files, history

api_router = APIRouter()

api_router.include_router(shares.router, prefix="/shares", tags=["shares"])
api_router.include_router(peers.router, prefix="/peers", tags=["peers"])
api_router.include_router(files.router, prefix="/files", tags=["files"])
api_router.include_router(history.router, prefix="/history", tags=["history"])
