export interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
}

export interface TransferFile extends FileItem {
  progress: number;
  status: "pending" | "uploading" | "downloading" | "completed" | "error";
  speed?: number;
  timeRemaining?: number;
}

export type ConnectionStatus =
  | "idle"
  | "waiting"
  | "connecting"
  | "connected"
  | "transferring"
  | "completed"
  | "error";

export interface PeerConnection {
  peerId: string;
  status: ConnectionStatus;
  connectedAt?: Date;
}

export interface Transfer {
  id: string;
  files: TransferFile[];
  shareLink: string;
  createdAt: Date;
  expiresAt?: Date;
  connection: PeerConnection | null;
  totalSize: number;
  transferredSize: number;
}

export interface ShareLink {
  id: string;
  shortCode: string;
  fullUrl: string;
  createdAt: Date;
  accessCount: number;
}
