import { useState, useCallback, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { PageLayout } from "../components/layout";
import { FileQueue, type FileItem } from "../components/fileManagement";
import { SharePanel } from "../components/sharing";
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
  const webrtcRef = useRef<WebRTCFileTransfer | null>(null);
  const remotePeerIdRef = useRef<string | null>(null);

  // Initialize WebSocket signaling and WebRTC
  useEffect(() => {
    if (!shareData) return;

    const client = new SignalingClient(
      shareData.peer_id,
      shareData.session_id
    );
    signalingClientRef.current = client;

    // Initialize WebRTC as sender
    const webrtc = new WebRTCFileTransfer(true);
    webrtcRef.current = webrtc;

    webrtc.initialize().then(() => {
      console.log("WebRTC initialized as sender");
    });

    // Store ICE candidates until we have a remote peer
    const pendingIceCandidates: RTCIceCandidate[] = [];

    // Handle ICE candidates
    webrtc.onIceCandidate = (candidate) => {
      console.log("Sender ICE candidate generated:", candidate.candidate?.substring(0, 50));
      if (remotePeerIdRef.current && client.isConnected()) {
        console.log("Sending ICE candidate to:", remotePeerIdRef.current);
        client.send({
          type: "ice_candidate",
          target_peer_id: remotePeerIdRef.current,
          candidate: candidate.toJSON(),
        });
      } else {
        console.log("Queuing ICE candidate - remote peer:", remotePeerIdRef.current, "connected:", client.isConnected());
        pendingIceCandidates.push(candidate);
      }
    };

    // Function to send queued ICE candidates
    const sendPendingCandidates = () => {
      if (pendingIceCandidates.length > 0 && remotePeerIdRef.current) {
        console.log(`Sending ${pendingIceCandidates.length} queued ICE candidates`);
        pendingIceCandidates.forEach(candidate => {
          client.send({
            type: "ice_candidate",
            target_peer_id: remotePeerIdRef.current!,
            candidate: candidate.toJSON(),
          });
        });
        pendingIceCandidates.length = 0;
      }
    };

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
        remotePeerIdRef.current = message.peer_id;
        setConnectionStatus("connecting");

        // Send any queued ICE candidates now that we have a remote peer
        sendPendingCandidates();

        // Create and send offer
        try {
          const offer = await webrtc.createOffer();
          client.send({
            type: "offer",
            target_peer_id: message.peer_id,
            sdp: offer,
          });
          console.log("Sent WebRTC offer");

          // Send any ICE candidates generated during offer creation
          sendPendingCandidates();
        } catch (error) {
          console.error("Failed to create offer:", error);
          setConnectionStatus("error");
        }
      } else if (message.type === "peer_left") {
        console.log("Peer left:", message.peer_id);
        remotePeerIdRef.current = null;
        setConnectionStatus("waiting");
      } else if (message.type === "answer" && message.sdp) {
        console.log("Received WebRTC answer from:", message.from_peer_id);
        try {
          await webrtc.setRemoteDescription(message.sdp);
          console.log("Remote description set, connection should establish");

          // Send any remaining queued ICE candidates
          sendPendingCandidates();

          setConnectionStatus("connected");

          // Start sending files
          if (actualFilesRef.current.length > 0) {
            setConnectionStatus("transferring");
            for (const file of actualFilesRef.current) {
              console.log("Sending file:", file.name);
              const startTime = Date.now();
              await webrtc.sendFile(file);
              const endTime = Date.now();
              const durationSeconds = Math.floor((endTime - startTime) / 1000);

              // Create transfer history record
              try {
                await apiService.createTransferHistory({
                  share_id: shareData.share_id,
                  transfer_type: "sent",
                  file_name: file.name,
                  file_size: file.size,
                  peer_info: remotePeerIdRef.current || "Unknown",
                  status: "completed",
                  duration_seconds: durationSeconds,
                });
                console.log("Transfer history recorded for:", file.name);
              } catch (error) {
                console.error("Failed to record transfer history:", error);
              }
            }
            console.log("All files sent!");
            setConnectionStatus("completed");
          }
        } catch (error) {
          console.error("Failed to set remote description:", error);
          setConnectionStatus("error");
        }
      } else if (message.type === "ice_candidate" && message.candidate) {
        console.log("Received ICE candidate");
        try {
          await webrtc.addIceCandidate(message.candidate);
        } catch (error) {
          console.error("Failed to add ICE candidate:", error);
        }
      }
    });

    return () => {
      cleanup();
      client.disconnect();
      webrtc.close();
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

        <SharePanel shareLink={shareCode} connectionStatus={connectionStatus} />
      </div>
    </PageLayout>
  );
}
