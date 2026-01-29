import { useState, useCallback, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { PageLayout } from "../components/layout";
import { FileQueue, type FileItem } from "../components/fileManagement";
import { SharePanel } from "../components/sharing";
import { type ConnectedPeer } from "../components/sharing/ConnectionStatus";
import type { ShareCreateResponse } from "../services/api";
import { apiService } from "../services/api";
import { SignalingClient, type SignalingMessage } from "../services/websocket";
import { WebRTCFileTransfer } from "../services/webrtc";

const fileToFileItem = (file: File): FileItem => ({
  id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
  name: file.name,
  size: file.size,
  type: file.type || "application/octet-stream",
});

export function SharePage() {
  const location = useLocation();
  const initialFiles = (location.state?.files as File[] | FileItem[]) || [];
  const shareData = location.state?.shareData as ShareCreateResponse | undefined;

  // Store actual File objects for transfer
  const actualFilesRef = useRef<File[]>([]);

  // Handle both File objects and FileItem objects
  const [files, setFiles] = useState<FileItem[]>(() => {
    return initialFiles.map((file) => {
      // Check if it's already a FileItem (has id property but not lastModified)
      if ('id' in file && !('lastModified' in file)) {
        return file as FileItem;
      }
      // Otherwise, convert File to FileItem
      return fileToFileItem(file as File);
    });
  });

  const [shareCode] = useState(shareData?.share_code || "LOADING...");
  const [connectionStatus, setConnectionStatus] = useState<
    "waiting" | "connecting" | "connected" | "transferring" | "completed" | "error"
  >("waiting");
  
  const [connectedPeers, setConnectedPeers] = useState<ConnectedPeer[]>([]);

  // Extract actual File objects once on mount
  useEffect(() => {
    const fileObjects: File[] = [];
    initialFiles.forEach((file) => {
      if ('lastModified' in file) {
        fileObjects.push(file as File);
      }
    });
    actualFilesRef.current = fileObjects;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signalingClientRef = useRef<SignalingClient | null>(null);
  // Store multiple peer connections mapped by peerId
  const webrtcConnectionsRef = useRef<Map<string, WebRTCFileTransfer>>(new Map());
  const remotePeerIdRef = useRef<string | null>(null);

  const cleanupConnections = () => {
    // Close all WebRTC connections
    webrtcConnectionsRef.current.forEach((conn) => {
        try { conn.close(); } catch (e) { /* ignore */ }
    });
    webrtcConnectionsRef.current.clear();

    if (signalingClientRef.current) {
      signalingClientRef.current.disconnect();
      signalingClientRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupConnections();
    };
  }, []);

  // Initialize WebSocket signaling and WebRTC
  useEffect(() => {
    if (!shareData) return;

    // Ensure any previous connections are closed
    cleanupConnections();

    const client = new SignalingClient(
      shareData.peer_id,
      shareData.session_id
    );
    signalingClientRef.current = client;

    // Note: We don't initialize a default WebRTC instance anymore.
    // Instances are created on-demand when peers join.

    client
      .connect()
      .then(() => {
        console.log("Connected to signaling server");
        setConnectionStatus("waiting");
      })
      .catch((error) => {
        console.error("Failed to connect to signaling server:", error);
        setConnectionStatus("error");
      });

    // Listen for peer connections and handle WebRTC signaling
    const cleanup = client.onMessage(async (message: SignalingMessage) => {
      if (message.type === "peer_joined") {
        console.log("Peer joined:", message.peer_id);
        
        // Add new peer to list
        setConnectedPeers(prev => {
            if (prev.find(p => p.id === message.peer_id)) return prev;
            return [...prev, { id: message.peer_id, name: `Device ${prev.length + 1}`, status: 'downloading', progress: 0 }];
        });

        // Create NEW WebRTC instance for this specific peer
        if (webrtcConnectionsRef.current.has(message.peer_id)) {
            try { webrtcConnectionsRef.current.get(message.peer_id)?.close(); } catch (e) { /* ignore */ }
        }
        
        const newWebRTC = new WebRTCFileTransfer(true);
        webrtcConnectionsRef.current.set(message.peer_id, newWebRTC);
        
        await newWebRTC.initialize();
        console.log(`WebRTC initialized for peer ${message.peer_id}`);

        // Re-attach ICE candidate listener to new instance
        newWebRTC.onIceCandidate = (candidate) => {
            if (client.isConnected()) {
                client.send({
                    type: "ice_candidate",
                    target_peer_id: message.peer_id, // Send only to this peer
                    candidate: candidate.toJSON(),
                });
            }
        };
        
        // Re-attach progress listener
        newWebRTC.onPeerProgress((report) => {
            setConnectedPeers(prev => {
                return prev.map(p => p.id === message.peer_id ? { 
                    ...p, 
                    status: report.status, 
                    progress: report.progress,
                    speed: report.speed,
                    timeRemaining: report.timeRemaining
                } : p);
            });
            
            // Check global status
            if (report.status === 'downloading') {
                setConnectionStatus('transferring');
            }
        });

        // Create and send offer
        try {
          const offer = await newWebRTC.createOffer();
          client.send({
            type: "offer",
            target_peer_id: message.peer_id,
            sdp: offer,
          });
          console.log(`Sent WebRTC offer to ${message.peer_id}`);
        } catch (error) {
          console.error("Failed to create offer:", error);
          setConnectionStatus("error");
        }
      } else if (message.type === "peer_left") {
        console.log("Peer left:", message.peer_id);
        
        // Clean up specific connection
        if (webrtcConnectionsRef.current.has(message.peer_id)) {
            try { webrtcConnectionsRef.current.get(message.peer_id)?.close(); } catch (e) { /* ignore */ }
            webrtcConnectionsRef.current.delete(message.peer_id);
        }

        // Remove peer from list
        setConnectedPeers(prev => prev.filter(p => p.id !== message.peer_id));
        
        if (webrtcConnectionsRef.current.size === 0) {
            setConnectionStatus("waiting");
        }
        
      } else if (message.type === "answer" && message.sdp && message.from_peer_id) {
        console.log("Received WebRTC answer from:", message.from_peer_id);
        const peerConnection = webrtcConnectionsRef.current.get(message.from_peer_id);
        
        if (peerConnection) {
            try {
                await peerConnection.setRemoteDescription(message.sdp);
                console.log("Remote description set for", message.from_peer_id);

                setConnectionStatus("connected");

                // Start sending files TO THIS PEER
                if (actualFilesRef.current.length > 0) {
                    setConnectionStatus("transferring");
                    // Run transfer in background
                    (async () => {
                        for (const file of actualFilesRef.current) {
                            console.log(`Sending file ${file.name} to ${message.from_peer_id}`);
                            try {
                                await peerConnection.sendFile(file);
                                
                                await apiService.createTransferHistory({
                                    share_id: shareData.share_id,
                                    transfer_type: "sent",
                                    file_name: file.name,
                                    file_size: file.size,
                                    peer_info: message.from_peer_id || "Unknown",
                                    status: "completed",
                                });
                            } catch (e) {
                                console.error("Error sending file:", e);
                            }
                        }
                        console.log(`All files sent to ${message.from_peer_id}`);
                    })();
                }
            } catch (error) {
                console.error("Failed to set remote description:", error);
            }
        }
      } else if (message.type === "ice_candidate" && message.candidate && message.from_peer_id) {
        console.log("Received ICE candidate from", message.from_peer_id);
        const peerConnection = webrtcConnectionsRef.current.get(message.from_peer_id);
        if (peerConnection) {
            try {
                await peerConnection.addIceCandidate(message.candidate);
            } catch (error) {
                console.error("Failed to add ICE candidate:", error);
            }
        }
      }
    });

    return () => {
      cleanup();
      cleanupConnections();
    };
  }, [shareData]);

  const handleRemoveFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const handleClearAll = useCallback(() => {
    setFiles([]);
  }, []);

  const handleAddMore = useCallback(async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      const newFiles = Array.from(target.files || []).map(fileToFileItem);

      // Add to local state immediately for UI feedback
      setFiles((prev) => [...prev, ...newFiles]);

      // If we have a share session, add files to backend
      if (shareData?.share_code) {
        try {
          await apiService.addFilesToShare(shareData.share_code, newFiles);
          console.log("Files added to share successfully");
        } catch (err) {
          console.error("Failed to add files to share:", err);
          // Revert the local state if backend fails
          setFiles((prev) => prev.filter(f => !newFiles.find(nf => nf.id === f.id)));
          alert("Failed to add files to share. Please try again.");
        }
      }
    };
    input.click();
  }, [shareData]);

  return (
    <PageLayout
      headerVariant="glass"
      className="flex items-center justify-center py-4 px-4 min-h-[calc(100vh-140px)]"
      navItems={[
        { to: "/receive", label: "Receive" },
        { to: "/files", label: "Files" },
        { to: "/history", label: "History" },
      ]}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none ">
      </div>
              {/* <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent-amber/5 blur-[120px] pointer-events-none" /> */}

      <div className="relative z-10 grid w-full max-w-4xl grid-cols-1 gap-4 lg:grid-cols-12 borderz">
        <FileQueue
          files={files}
          onRemoveFile={handleRemoveFile}
          onClearAll={handleClearAll}
          onAddMore={handleAddMore}
        />

        <SharePanel 
            shareLink={shareCode} 
            connectionStatus={connectionStatus} 
            peers={connectedPeers} 
        />
      </div>
    </PageLayout>
  );
}
