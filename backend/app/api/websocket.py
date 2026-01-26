from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Set
import json
import logging

from app.db.database import get_db

logger = logging.getLogger(__name__)

router = APIRouter()


class ConnectionManager:
    """Manages WebSocket connections for WebRTC signaling"""

    def __init__(self):
        # Store active connections: peer_id -> WebSocket
        self.active_connections: Dict[str, WebSocket] = {}
        # Store session peers: session_id -> Set[peer_id]
        self.session_peers: Dict[str, Set[str]] = {}

    async def connect(self, websocket: WebSocket, peer_id: str, session_id: str):
        """Register a new WebSocket connection"""
        # Note: websocket should already be accepted before calling this

        # If peer already connected, close old connection
        if peer_id in self.active_connections:
            logger.info(f"Peer {peer_id} reconnecting - closing old connection")
            old_ws = self.active_connections[peer_id]
            try:
                await old_ws.close()
            except Exception:
                pass  # Old connection might already be closed

        self.active_connections[peer_id] = websocket

        if session_id not in self.session_peers:
            self.session_peers[session_id] = set()
        self.session_peers[session_id].add(peer_id)

        logger.info(f"Peer {peer_id} connected to session {session_id}. Total peers in session: {len(self.session_peers[session_id])}")

    def disconnect(self, peer_id: str, session_id: str):
        """Remove a WebSocket connection"""
        if peer_id in self.active_connections:
            del self.active_connections[peer_id]

        if session_id in self.session_peers:
            self.session_peers[session_id].discard(peer_id)
            if not self.session_peers[session_id]:
                del self.session_peers[session_id]

        logger.info(f"Peer {peer_id} disconnected from session {session_id}")

    async def send_to_peer(self, peer_id: str, message: dict):
        """Send a message to a specific peer"""
        if peer_id in self.active_connections:
            websocket = self.active_connections[peer_id]
            try:
                await websocket.send_json(message)
            except Exception as e:
                logger.error(f"Error sending message to peer {peer_id}: {e}")

    async def broadcast_to_session(self, session_id: str, message: dict, exclude_peer: str = None):
        """Broadcast a message to all peers in a session"""
        if session_id in self.session_peers:
            for peer_id in self.session_peers[session_id]:
                if peer_id != exclude_peer:
                    await self.send_to_peer(peer_id, message)

    def get_session_peers(self, session_id: str) -> Set[str]:
        """Get all peers in a session"""
        return self.session_peers.get(session_id, set())


manager = ConnectionManager()


@router.websocket("/signaling")
async def websocket_signaling(websocket: WebSocket):
    """
    WebRTC signaling server endpoint

    Handles:
    - Peer connection establishment
    - SDP offer/answer exchange
    - ICE candidate exchange
    - Peer discovery
    """
    peer_id = None
    session_id = None

    try:
        # Wait for initial connection message
        await websocket.accept()
        init_message = await websocket.receive_json()

        if init_message.get("type") != "join":
            await websocket.send_json({
                "type": "error",
                "message": "First message must be 'join' type"
            })
            await websocket.close()
            return

        peer_id = init_message.get("peer_id")
        session_id = init_message.get("session_id")

        if not peer_id or not session_id:
            await websocket.send_json({
                "type": "error",
                "message": "peer_id and session_id are required"
            })
            await websocket.close()
            return

        # Register connection
        await manager.connect(websocket, peer_id, session_id)

        # Notify other peers in the session
        other_peers = manager.get_session_peers(session_id) - {peer_id}
        logger.info(f"Notifying {len(other_peers)} other peers about {peer_id} joining: {other_peers}")
        await manager.broadcast_to_session(
            session_id,
            {
                "type": "peer_joined",
                "peer_id": peer_id,
                "timestamp": init_message.get("timestamp")
            },
            exclude_peer=peer_id
        )

        # Send confirmation
        await websocket.send_json({
            "type": "joined",
            "peer_id": peer_id,
            "session_id": session_id,
            "peers": list(manager.get_session_peers(session_id) - {peer_id})
        })

        # Handle messages
        while True:
            message = await websocket.receive_json()
            message_type = message.get("type")

            if message_type == "offer":
                # Forward WebRTC offer to target peer
                target_peer = message.get("target_peer_id")
                logger.info(f"Forwarding offer from {peer_id} to {target_peer}")
                if target_peer:
                    await manager.send_to_peer(target_peer, {
                        "type": "offer",
                        "from_peer_id": peer_id,
                        "sdp": message.get("sdp")
                    })

            elif message_type == "answer":
                # Forward WebRTC answer to target peer
                target_peer = message.get("target_peer_id")
                logger.info(f"Forwarding answer from {peer_id} to {target_peer}")
                if target_peer:
                    await manager.send_to_peer(target_peer, {
                        "type": "answer",
                        "from_peer_id": peer_id,
                        "sdp": message.get("sdp")
                    })

            elif message_type == "ice_candidate":
                # Forward ICE candidate to target peer
                target_peer = message.get("target_peer_id")
                logger.info(f"Forwarding ICE candidate from {peer_id} to {target_peer}")
                if target_peer:
                    await manager.send_to_peer(target_peer, {
                        "type": "ice_candidate",
                        "from_peer_id": peer_id,
                        "candidate": message.get("candidate")
                    })

            elif message_type == "ping":
                # Respond to ping
                await websocket.send_json({
                    "type": "pong",
                    "timestamp": message.get("timestamp")
                })

            else:
                logger.warning(f"Unknown message type: {message_type}")

    except WebSocketDisconnect:
        logger.info(f"Peer {peer_id} disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        if peer_id and session_id:
            manager.disconnect(peer_id, session_id)

            # Notify other peers
            await manager.broadcast_to_session(
                session_id,
                {
                    "type": "peer_left",
                    "peer_id": peer_id
                },
                exclude_peer=peer_id
            )


@router.get("/signaling/sessions")
async def get_active_sessions():
    """Get information about active signaling sessions (for monitoring)"""
    return {
        "total_connections": len(manager.active_connections),
        "active_sessions": len(manager.session_peers),
        "sessions": {
            session_id: list(peers)
            for session_id, peers in manager.session_peers.items()
        }
    }
