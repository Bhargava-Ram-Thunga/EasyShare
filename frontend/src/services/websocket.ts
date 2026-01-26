const WS_BASE_URL =
  import.meta.env.VITE_WS_URL || "ws://localhost:8000";

export type SignalingMessage =
  | {
      type: "join";
      peer_id: string;
      session_id: string;
      timestamp?: number;
    }
  | {
      type: "joined";
      peer_id: string;
      session_id: string;
      peers: string[];
    }
  | {
      type: "peer_joined";
      peer_id: string;
      timestamp?: number;
    }
  | {
      type: "peer_left";
      peer_id: string;
    }
  | {
      type: "offer";
      from_peer_id?: string;
      target_peer_id?: string;
      sdp: RTCSessionDescriptionInit;
    }
  | {
      type: "answer";
      from_peer_id?: string;
      target_peer_id?: string;
      sdp: RTCSessionDescriptionInit;
    }
  | {
      type: "ice_candidate";
      from_peer_id?: string;
      target_peer_id?: string;
      candidate: RTCIceCandidateInit;
    }
  | {
      type: "ping";
      timestamp: number;
    }
  | {
      type: "pong";
      timestamp: number;
    }
  | {
      type: "error";
      message: string;
    };

export class SignalingClient {
  private ws: WebSocket | null = null;
  private peerId: string;
  private sessionId: string;
  private messageHandlers: Map<string, (message: SignalingMessage) => void> =
    new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor(peerId: string, sessionId: string) {
    this.peerId = peerId;
    this.sessionId = sessionId;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(`${WS_BASE_URL}/ws/signaling`);

        this.ws.onopen = () => {
          console.log("WebSocket connected");
          this.reconnectAttempts = 0;

          // Send join message
          this.send({
            type: "join",
            peer_id: this.peerId,
            session_id: this.sessionId,
            timestamp: Date.now(),
          });

          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: SignalingMessage = JSON.parse(event.data);
            console.log("Received signaling message:", message);

            // Call all registered handlers
            this.messageHandlers.forEach((handler) => handler(message));
          } catch (error) {
            console.error("Error parsing signaling message:", error);
          }
        };

        this.ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log("WebSocket disconnected");
          this.handleReconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * this.reconnectAttempts;
      console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

      setTimeout(() => {
        this.connect().catch((error) => {
          console.error("Reconnection failed:", error);
        });
      }, delay);
    } else {
      console.error("Max reconnection attempts reached");
    }
  }

  send(message: SignalingMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error("WebSocket is not connected");
    }
  }

  onMessage(handler: (message: SignalingMessage) => void): () => void {
    const id = Math.random().toString(36);
    this.messageHandlers.set(id, handler);

    // Return cleanup function
    return () => {
      this.messageHandlers.delete(id);
    };
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.messageHandlers.clear();
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}
