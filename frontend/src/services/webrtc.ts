/**
 * WebRTC File Transfer Service
 * Handles peer-to-peer file transfers using WebRTC data channels
 */

const CHUNK_SIZE = 16384; // 16KB chunks

export interface TransferProgress {
  fileId: string;
  fileName: string;
  progress: number;
  bytesTransferred: number;
  totalBytes: number;
  speed: number; // bytes per second
  timeRemaining: number; // seconds
}

export interface FileTransferMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  totalChunks: number;
}

type ProgressCallback = (progress: TransferProgress) => void;
type CompletionCallback = (fileId: string, blob: Blob) => void;
type ErrorCallback = (error: Error) => void;

export class WebRTCFileTransfer {
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private isSender: boolean;
  private receivedChunks: Map<string, Uint8Array[]> = new Map();
  private fileMetadata: Map<string, FileTransferMetadata> = new Map();
  private progressCallback: ProgressCallback | null = null;
  private completionCallback: CompletionCallback | null = null;
  private errorCallback: ErrorCallback | null = null;
  private transferStartTime: number = 0;
  private lastProgressUpdate: number = 0;
  private pendingChunkHeader: any = null; // Track the header for the next binary message

  constructor(isSender: boolean) {
    this.isSender = isSender;
  }

  /**
   * Initialize WebRTC peer connection
   */
  async initialize(): Promise<void> {
    // For local testing, empty iceServers works - host candidates are sufficient
    // For production across networks, add STUN/TURN servers
    const config: RTCConfiguration = {
      iceServers: [], // Empty for local testing - generates host candidates only
      // Uncomment for production:
      // iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    };

    console.log('Initializing WebRTC with config:', config);
    console.log('Browser:', navigator.userAgent.includes('Firefox') ? 'Firefox' : 'Other');
    console.log('WebRTC support:', typeof RTCPeerConnection !== 'undefined');

    this.peerConnection = new RTCPeerConnection(config);

    // Set up ICE candidate handling
    this.peerConnection.onicecandidate = (event) => {
      console.log('onicecandidate event fired:', event.candidate ? 'has candidate' : 'null (gathering complete)');
      if (event.candidate) {
        console.log('ICE candidate generated:', event.candidate.candidate?.substring(0, 60));
        // Send to signaling server
        if (this.onIceCandidate) {
          console.log('Calling onIceCandidate callback');
          this.onIceCandidate(event.candidate);
        } else {
          console.warn('onIceCandidate callback not set!');
        }
      }
    };

    // Connection state monitoring
    this.peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', this.peerConnection?.connectionState);
      if (this.peerConnection?.connectionState === 'failed') {
        console.error('WebRTC connection failed - check ICE candidates and network');
      }
    };

    // ICE connection state monitoring
    this.peerConnection.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', this.peerConnection?.iceConnectionState);
      if (this.peerConnection?.iceConnectionState === 'failed') {
        console.error('ICE connection failed - TURN server may be required');
      }
    };

    // ICE gathering state monitoring
    this.peerConnection.onicegatheringstatechange = () => {
      console.log('ICE gathering state:', this.peerConnection?.iceGatheringState);
    };

    if (this.isSender) {
      // Sender creates the data channel
      this.dataChannel = this.peerConnection.createDataChannel('fileTransfer', {
        ordered: true,
      });
      this.setupDataChannel();
    } else {
      // Receiver waits for data channel
      this.peerConnection.ondatachannel = (event) => {
        this.dataChannel = event.channel;
        this.setupDataChannel();
      };
    }
  }

  /**
   * Set up data channel event handlers
   */
  private setupDataChannel(): void {
    if (!this.dataChannel) return;

    this.dataChannel.binaryType = 'arraybuffer';

    this.dataChannel.onopen = () => {
      console.log('Data channel opened, ready to transfer files');
      // Don't automatically send file here - let the application control when to send
    };

    this.dataChannel.onclose = () => {
      console.log('Data channel closed');
    };

    this.dataChannel.onerror = (error) => {
      console.error('Data channel error:', error);
      this.errorCallback?.(new Error('Data channel error'));
    };

    if (!this.isSender) {
      this.dataChannel.onmessage = (event) => {
        this.handleReceivedData(event.data);
      };
    }
  }

  /**
   * Create and return SDP offer (for sender)
   */
  async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    console.log('Creating offer...');
    const offer = await this.peerConnection.createOffer();
    console.log('Offer created, setting local description...');

    await this.peerConnection.setLocalDescription(offer);
    console.log('Local description set. ICE gathering state:', this.peerConnection.iceGatheringState);

    // Wait for ICE gathering to complete (important for Firefox)
    if (this.peerConnection.iceGatheringState !== 'complete') {
      console.log('Waiting for ICE gathering to complete...');
      await new Promise<void>((resolve) => {
        const checkState = () => {
          if (this.peerConnection?.iceGatheringState === 'complete') {
            console.log('ICE gathering complete');
            resolve();
          }
        };

        // Check immediately in case it's already complete
        checkState();

        // Also listen for state changes
        this.peerConnection!.onicegatheringstatechange = () => {
          console.log('ICE gathering state changed:', this.peerConnection?.iceGatheringState);
          checkState();
        };

        // Timeout after 5 seconds - proceed anyway with trickle ICE
        setTimeout(() => {
          console.log('ICE gathering timeout, proceeding with current candidates');
          resolve();
        }, 5000);
      });
    }

    // Return the local description which now includes gathered candidates
    return this.peerConnection.localDescription!;
  }

  /**
   * Create and return SDP answer (for receiver)
   */
  async createAnswer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    console.log('Setting remote description (offer)...');
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    console.log('Remote description set. Signaling state:', this.peerConnection.signalingState);

    console.log('Creating answer...');
    const answer = await this.peerConnection.createAnswer();
    console.log('Answer created, setting local description...');

    await this.peerConnection.setLocalDescription(answer);
    console.log('Local description set. ICE gathering state:', this.peerConnection.iceGatheringState);

    // Wait for ICE gathering to complete (important for Firefox)
    if (this.peerConnection.iceGatheringState !== 'complete') {
      console.log('Waiting for ICE gathering to complete...');
      await new Promise<void>((resolve) => {
        const checkState = () => {
          if (this.peerConnection?.iceGatheringState === 'complete') {
            console.log('ICE gathering complete');
            resolve();
          }
        };

        // Check immediately in case it's already complete
        checkState();

        // Also listen for state changes
        const originalHandler = this.peerConnection!.onicegatheringstatechange;
        const pc = this.peerConnection!;
        this.peerConnection!.onicegatheringstatechange = (event) => {
          console.log('ICE gathering state changed:', pc.iceGatheringState);
          if (originalHandler) {
            originalHandler.call(pc, event);
          }
          checkState();
        };

        // Timeout after 5 seconds - proceed anyway with trickle ICE
        setTimeout(() => {
          console.log('ICE gathering timeout, proceeding with current candidates');
          resolve();
        }, 5000);
      });
    }

    // Return the local description which now includes gathered candidates
    return this.peerConnection.localDescription!;
  }

  /**
   * Set remote description (SDP answer for sender, offer for receiver)
   */
  async setRemoteDescription(description: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    console.log('Setting remote description (answer)...');
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(description));
    console.log('Remote description set. Signaling state:', this.peerConnection.signalingState);
    console.log('ICE gathering state:', this.peerConnection.iceGatheringState);
    console.log('ICE connection state:', this.peerConnection.iceConnectionState);
  }

  /**
   * Add ICE candidate received from remote peer
   */
  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  }

  /**
   * Send a file through the data channel
   */
  async sendFile(file: File): Promise<void> {
    if (!this.dataChannel) {
      throw new Error('Data channel not initialized');
    }

    if (this.dataChannel.readyState !== 'open') {
      console.log('Data channel not ready, waiting...');
      // Wait for data channel to open
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Data channel open timeout')), 30000);

        const checkReady = () => {
          if (this.dataChannel?.readyState === 'open') {
            clearTimeout(timeout);
            resolve();
          } else {
            setTimeout(checkReady, 100);
          }
        };

        checkReady();
      });
    }

    console.log('Starting file transfer:', file.name);

    this.transferStartTime = Date.now();

    const metadata: FileTransferMetadata = {
      id: `${file.name}-${file.size}-${Date.now()}`,
      name: file.name,
      size: file.size,
      type: file.type,
      totalChunks: Math.ceil(file.size / CHUNK_SIZE),
    };

    // Send metadata first
    console.log('Sending file metadata:', metadata);
    this.dataChannel.send(JSON.stringify({ type: 'metadata', data: metadata }));

    // Read and send file in chunks
    const reader = new FileReader();
    let offset = 0;
    let chunkIndex = 0;

    const sendNextChunk = () => {
      if (offset >= file.size) {
        // Send completion message
        console.log(`File transfer complete: ${file.name} (${file.size} bytes)`);
        this.dataChannel?.send(JSON.stringify({ type: 'complete', fileId: metadata.id }));
        return;
      }

      const chunk = file.slice(offset, offset + CHUNK_SIZE);
      reader.readAsArrayBuffer(chunk);
    };

    reader.onload = (e) => {
      if (!e.target?.result || !this.dataChannel) return;

      const arrayBuffer = e.target.result as ArrayBuffer;

      // Send chunk with header
      const header = JSON.stringify({
        type: 'chunk',
        fileId: metadata.id,
        chunkIndex,
        totalChunks: metadata.totalChunks,
      });

      this.dataChannel.send(header);
      this.dataChannel.send(arrayBuffer);

      offset += CHUNK_SIZE;
      chunkIndex++;

      // Update progress
      const progress = Math.min((offset / file.size) * 100, 100);
      const elapsed = (Date.now() - this.transferStartTime) / 1000; // seconds
      const speed = offset / elapsed;
      const remaining = file.size - offset;
      const timeRemaining = remaining / speed;

      if (Date.now() - this.lastProgressUpdate > 100) {
        this.progressCallback?.({
          fileId: metadata.id,
          fileName: metadata.name,
          progress,
          bytesTransferred: offset,
          totalBytes: file.size,
          speed,
          timeRemaining,
        });
        this.lastProgressUpdate = Date.now();
      }

      // Send next chunk
      setTimeout(sendNextChunk, 0);
    };

    reader.onerror = () => {
      this.errorCallback?.(new Error('File reading error'));
    };

    sendNextChunk();
  }

  /**
   * Handle received data (for receiver)
   */
  private handleReceivedData(data: string | ArrayBuffer): void {
    if (typeof data === 'string') {
      // JSON message (metadata, chunk header, or completion)
      try {
        const message = JSON.parse(data);

        if (message.type === 'metadata') {
          const metadata = message.data as FileTransferMetadata;
          this.fileMetadata.set(metadata.id, metadata);
          this.receivedChunks.set(metadata.id, []);
          this.transferStartTime = Date.now();
          console.log('Receiving file:', metadata.name, `(${metadata.size} bytes, ${metadata.totalChunks} chunks)`);
        } else if (message.type === 'chunk') {
          // Store the chunk header, next message will be the binary data
          this.pendingChunkHeader = message;
        } else if (message.type === 'complete') {
          console.log('Transfer complete for:', message.fileId);
          this.assembleFile(message.fileId);
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    } else {
      // Binary data (file chunk)
      // Use the pending chunk header to identify this chunk
      if (!this.pendingChunkHeader) {
        console.error('Received binary data without chunk header');
        return;
      }

      const fileId = this.pendingChunkHeader.fileId;
      const chunkIndex = this.pendingChunkHeader.chunkIndex;
      const chunks = this.receivedChunks.get(fileId);
      const metadata = this.fileMetadata.get(fileId);

      if (chunks && metadata) {
        chunks.push(new Uint8Array(data as ArrayBuffer));

        // Update progress
        const bytesTransferred = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
        const progress = Math.min((bytesTransferred / metadata.size) * 100, 100);
        const elapsed = (Date.now() - this.transferStartTime) / 1000;
        const speed = bytesTransferred / elapsed;
        const remaining = metadata.size - bytesTransferred;
        const timeRemaining = remaining / speed;

        if (Date.now() - this.lastProgressUpdate > 100) {
          this.progressCallback?.({
            fileId,
            fileName: metadata.name,
            progress,
            bytesTransferred,
            totalBytes: metadata.size,
            speed,
            timeRemaining,
          });
          this.lastProgressUpdate = Date.now();
        }

        console.log(`Received chunk ${chunkIndex + 1}/${metadata.totalChunks} for ${metadata.name}`);
      } else {
        console.error('Cannot store chunk: missing metadata or chunks array for', fileId);
      }

      // Clear the pending header
      this.pendingChunkHeader = null;
    }
  }

  /**
   * Assemble received chunks into a file blob
   */
  private assembleFile(fileId: string): void {
    const chunks = this.receivedChunks.get(fileId);
    const metadata = this.fileMetadata.get(fileId);

    if (!chunks || !metadata) {
      console.error('Cannot assemble file: missing data');
      return;
    }

    const blob = new Blob(chunks as BlobPart[], { type: metadata.type });
    console.log('File received:', metadata.name, blob.size, 'bytes');

    this.completionCallback?.(fileId, blob);

    // Clean up
    this.receivedChunks.delete(fileId);
    this.fileMetadata.delete(fileId);
  }

  /**
   * Set progress callback
   */
  onProgress(callback: ProgressCallback): void {
    this.progressCallback = callback;
  }

  /**
   * Set completion callback
   */
  onComplete(callback: CompletionCallback): void {
    this.completionCallback = callback;
  }

  /**
   * Set error callback
   */
  onError(callback: ErrorCallback): void {
    this.errorCallback = callback;
  }

  /**
   * ICE candidate callback (to be set by user)
   */
  onIceCandidate?: (candidate: RTCIceCandidate) => void;

  /**
   * Close connection
   */
  close(): void {
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
  }
}
