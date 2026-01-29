import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { PageLayout } from "../components/layout";
import {
  CodeInputCard,
  ReceivingHeader,
  FileDownloadCard,
  SecurityFooter,
  FileSelectionList,
} from "../components/receiving";
import { apiService } from "../services/api";
import type { ShareDetailResponse } from "../services/api";
import { SignalingClient, type SignalingMessage } from "../services/websocket";
import { WebRTCFileTransfer } from "../services/webrtc";

interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
}

export function ReceivePage() {
  const { linkId } = useParams<{ linkId?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const codeFromUrl = searchParams.get("code");

  const [enteredCode, setEnteredCode] = useState<string | null>(
    linkId || codeFromUrl || null
  );
  const [shareDetails, setShareDetails] = useState<ShareDetailResponse | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFileSelection, setShowFileSelection] = useState(true);
  const [selectedFilesToDownload, setSelectedFilesToDownload] = useState<FileItem[]>([]);
  const [currentDownloadIndex, setCurrentDownloadIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState("0 MB/s");
  const [timeRemaining, setTimeRemaining] = useState("Calculating...");
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [downloadedFiles, setDownloadedFiles] = useState<string[]>([]);

  const signalingClientRef = useRef<SignalingClient | null>(null);
  const webrtcRef = useRef<WebRTCFileTransfer | null>(null);
  const receivedFilesRef = useRef<Map<string, Blob>>(new Map());

  // Fetch share details when code is entered
  useEffect(() => {
    try {
      if (!enteredCode) {
        setShareDetails(null);
        setLoading(false);
        return;
      }

      // Cleanup if enteredCode changes (e.g. user goes back/forward)
      cleanupConnections();

      const fetchShareDetails = async () => {
        setLoading(true);
        setError(null);

        try {
          const details = await apiService.getShareDetails(enteredCode);
          setShareDetails(details);
        } catch (err) {
          console.error("Failed to get share details:", err);
          setError(
            err instanceof Error ? err.message : "Failed to validate share code"
          );
          setEnteredCode(null);
        } finally {
          setLoading(false);
        }
      };

      fetchShareDetails();
    } catch (error) {
      console.error("Error in receive effect:", error);
      setLoading(false);
    }
  }, [enteredCode]);

  const handleCodeSubmit = useCallback((code: string) => {
    console.log("Code entered:", code);
    setEnteredCode(code);
    // Update URL to include the code for consistency with copy link URLs
    setSearchParams({ code }, { replace: true });
  }, [setSearchParams]);

  const handlePause = useCallback(() => {
    setIsPaused((prev) => {
      const newPausedState = !prev;
      console.log(newPausedState ? "Transfer paused" : "Transfer resumed");

      if (webrtcRef.current) {
        if (newPausedState) {
          webrtcRef.current.pause();
        } else {
          webrtcRef.current.resume();
        }
      }

      return newPausedState;
    });
  }, []);

  const cleanupConnections = () => {
    if (webrtcRef.current) {
      webrtcRef.current.close();
      webrtcRef.current = null;
    }
    
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

  const handleCancel = useCallback(() => {
    console.log("Transfer cancelled");
    
    if (webrtcRef.current) {
        webrtcRef.current.sendControl('cancel');
    }
    
    cleanupConnections();

    setEnteredCode(null);
    setShareDetails(null);
    setShowFileSelection(true);
    setSelectedFilesToDownload([]);
    setCurrentDownloadIndex(0);
  }, []);

  const handleFilesSelected = useCallback(async (files: FileItem[]) => {
    console.log("Files selected for download:", files);
    setSelectedFilesToDownload(files);
    setShowFileSelection(false);
    setCurrentDownloadIndex(0);
    setIsPaused(false); // Ensure pause state is reset

    if (!shareDetails || !enteredCode) return;

    try {
      // Initialize signaling client - use session_id to join same session as sender
      // Ensure any previous connections are closed
      cleanupConnections();

      const client = new SignalingClient(
        `receiver-${Date.now()}`,
        shareDetails.session_id
      );
      signalingClientRef.current = client;

      // Initialize WebRTC as receiver
      const webrtc = new WebRTCFileTransfer(false);
      webrtcRef.current = webrtc;

      await webrtc.initialize();
      console.log("WebRTC initialized as receiver");

      // Handle progress updates
      webrtc.onProgress((progressData) => {
        setProgress(progressData.progress);
        const speedMBps = (progressData.speed / (1024 * 1024)).toFixed(2);
        setSpeed(`${speedMBps} MB/s`);
        const timeRemainingStr = progressData.timeRemaining > 60
          ? `${Math.floor(progressData.timeRemaining / 60)}:${(progressData.timeRemaining % 60).toFixed(0).padStart(2, '0')}`
          : `${progressData.timeRemaining.toFixed(0)}s`;
        setTimeRemaining(timeRemainingStr);
      });

      // Handle file completion
      webrtc.onComplete(async (fileId, blob) => {
        console.log("File received:", fileId, blob.size, "bytes");
        receivedFilesRef.current.set(fileId, blob);

        // Find the file metadata
        const fileMetadata = files.find(f => fileId.includes(f.name));
        if (fileMetadata) {
          // Download the file
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileMetadata.name;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          console.log("File downloaded:", fileMetadata.name);

          // Track downloaded file
          setDownloadedFiles(prev => [...prev, fileMetadata.name]);

          // Create transfer history record
          try {
            await apiService.createTransferHistory({
              share_id: shareDetails.id,
              transfer_type: "received",
              file_name: fileMetadata.name,
              file_size: fileMetadata.size,
              peer_info: shareDetails.connection?.peer_id || "Unknown",
              status: "completed",
            });
            console.log("Transfer history recorded for:", fileMetadata.name);
          } catch (error) {
            console.error("Failed to record transfer history:", error);
          }

          // Check if all files are downloaded
          const newDownloadIndex = receivedFilesRef.current.size;
          if (newDownloadIndex >= files.length) {
            console.log("All files downloaded!");
            setDownloadComplete(true);
            cleanupConnections();
          }
        }

        // Move to next file
        setCurrentDownloadIndex(prev => prev + 1);
      });

      // Connect to signaling server
      await client.connect();

      // Track sender's peer ID for sending responses
      let senderPeerId: string | undefined = undefined;
      let remoteDescriptionSet = false;
      const pendingIceCandidates: RTCIceCandidateInit[] = [];
      const pendingOutgoingCandidates: RTCIceCandidate[] = [];

      // Function to add queued ICE candidates after remote description is set
      const addPendingCandidates = async () => {
        if (pendingIceCandidates.length > 0) {
          console.log(`Adding ${pendingIceCandidates.length} queued ICE candidates`);
          for (const candidate of pendingIceCandidates) {
            try {
              await webrtc.addIceCandidate(candidate);
            } catch (error) {
              console.error("Failed to add queued ICE candidate:", error);
            }
          }
          pendingIceCandidates.length = 0;
        }
      };

      // Function to send queued outgoing ICE candidates
      const sendPendingCandidates = () => {
        if (pendingOutgoingCandidates.length > 0 && senderPeerId) {
          console.log(`Sending ${pendingOutgoingCandidates.length} queued outgoing ICE candidates`);
          pendingOutgoingCandidates.forEach(candidate => {
            client.send({
              type: "ice_candidate",
              target_peer_id: senderPeerId!,
              candidate: candidate.toJSON(),
            });
          });
          pendingOutgoingCandidates.length = 0;
        }
      };

      // Set up ICE candidate handler BEFORE processing messages
      webrtc.onIceCandidate = (candidate) => {
        console.log("Receiver ICE candidate generated:", candidate.candidate?.substring(0, 50));
        if (senderPeerId && client.isConnected()) {
          console.log("Sending ICE candidate to:", senderPeerId);
          client.send({
            type: "ice_candidate",
            target_peer_id: senderPeerId,
            candidate: candidate.toJSON(),
          });
        } else {
          console.log("Queuing outgoing ICE candidate - senderPeerId:", senderPeerId);
          pendingOutgoingCandidates.push(candidate);
        }
      };

      // Handle signaling messages
      client.onMessage(async (message: SignalingMessage) => {
        if (message.type === "offer" && message.sdp) {
          console.log("Received WebRTC offer from:", message.from_peer_id);
          senderPeerId = message.from_peer_id;

          try {
            const answer = await webrtc.createAnswer(message.sdp);
            remoteDescriptionSet = true;

            // Send the answer
            client.send({
              type: "answer",
              target_peer_id: senderPeerId,
              sdp: answer,
            });
            console.log("Sent WebRTC answer to:", senderPeerId);

            // Add any ICE candidates we received before setting remote description
            await addPendingCandidates();

            // Send any outgoing ICE candidates that were queued
            sendPendingCandidates();
          } catch (error) {
            console.error("Failed to create answer:", error);
          }
        } else if (message.type === "ice_candidate" && message.candidate) {
          console.log("Received ICE candidate from:", message.from_peer_id);
          if (!senderPeerId && message.from_peer_id) {
            senderPeerId = message.from_peer_id;
          }

          if (remoteDescriptionSet) {
            try {
              await webrtc.addIceCandidate(message.candidate);
              console.log("Added ICE candidate successfully");
            } catch (error) {
              console.error("Failed to add ICE candidate:", error);
            }
          } else {
            console.log("Queuing incoming ICE candidate - remote description not set yet");
            pendingIceCandidates.push(message.candidate);
          }
        }
      });

    } catch (error) {
      console.error("Failed to start file transfer:", error);
      alert("Failed to start file transfer. Please try again.");
    }
  }, [shareDetails, enteredCode]);

  const handleCancelSelection = useCallback(() => {
    setEnteredCode(null);
    setShareDetails(null);
    setShowFileSelection(true);
  }, []);

  const currentFile = selectedFilesToDownload[currentDownloadIndex];
  const nextFile = selectedFilesToDownload[currentDownloadIndex + 1];

  return (
    <PageLayout
      headerVariant="glass"
      className="flex items-center justify-center px-4 py-6 min-h-[calc(100vh-140px)]"
      navItems={[
        { to: "/", label: "Share" },
        { to: "/files", label: "Files" },
        { to: "/history", label: "History" },
      ]}
    >
      <div className="w-full max-w-[580px] flex flex-col gap-4 my-auto">
        {!enteredCode ? (
          <>
            <CodeInputCard onCodeSubmit={handleCodeSubmit} />
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
          </>
        ) : loading ? (
          <div className="p-8 text-center">
            <p className="text-gray-400">Validating share code...</p>
          </div>
        ) : shareDetails ? (
          <>
            {showFileSelection ? (
              <>
                <ReceivingHeader />
                <FileSelectionList
                  files={shareDetails.files}
                  onDownloadSelected={handleFilesSelected}
                  onCancel={handleCancelSelection}
                />
                <SecurityFooter />
              </>
            ) : downloadComplete ? (
              <>
                {/* Success State */}
                <div className="group relative rounded-xl bg-surface-dark border border-white/5 shadow-glow overflow-hidden">
                  <div className="p-6 md:p-8 flex flex-col items-center text-center">
                    {/* Success icon */}
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-800 to-black border border-primary/30 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(0,255,230,0.3)]">
                      <svg
                        className="w-8 h-8 text-primary drop-shadow-[0_0_8px_rgba(0,255,230,0.6)]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>

                    <h2 className="text-xl font-bold text-white mb-2">Download Complete!</h2>
                    <p className="text-gray-400 mb-6">
                      {downloadedFiles.length} {downloadedFiles.length === 1 ? 'file has' : 'files have'} been downloaded successfully.
                    </p>

                    {/* Downloaded files list */}
                    <div className="w-full rounded-lg bg-gradient-to-br from-gray-800/50 to-black/50 border border-white/5 p-4 mb-6">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Downloaded files</p>
                      <ul className="text-sm space-y-2">
                        {downloadedFiles.map((name, index) => (
                          <li key={index} className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0">
                              <svg
                                className="w-3 h-3 text-primary"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <span className="text-gray-300">{name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Action button */}
                    <button
                      onClick={() => {
                        setDownloadComplete(false);
                        setDownloadedFiles([]);
                        setEnteredCode(null);
                        setShareDetails(null);
                        setShowFileSelection(true);
                        setSelectedFilesToDownload([]);
                        setCurrentDownloadIndex(0);
                        setProgress(0);
                      }}
                      className="px-6 py-2.5 bg-gradient-to-r from-primary to-primary/80 text-black font-bold rounded-lg hover:from-primary/90 hover:to-primary/70 transition-all shadow-[0_0_15px_rgba(0,255,230,0.3)] hover:shadow-[0_0_20px_rgba(0,255,230,0.5)]"
                    >
                      Receive More Files
                    </button>
                  </div>
                </div>
                <SecurityFooter />
              </>
            ) : (
              <>
                <ReceivingHeader />

                {currentFile && (
                  <FileDownloadCard
                    fileName={currentFile.name}
                    fileSize={currentFile.size}
                    fileType={currentFile.type}
                    progress={progress}
                    speed={speed}
                    timeRemaining={timeRemaining}
                    isPaused={isPaused}
                    onPause={handlePause}
                    onCancel={handleCancel}
                  />
                )}

                {nextFile && (
                  <div className="p-4 bg-surface-dark border border-border-dark-alt rounded-lg">
                    <p className="text-sm text-gray-400">
                      Up next: <span className="text-white font-bold">{nextFile.name}</span>
                    </p>
                  </div>
                )}

                <SecurityFooter />
              </>
            )}
          </>
        ) : null}
      </div>
    </PageLayout>
  );
}
