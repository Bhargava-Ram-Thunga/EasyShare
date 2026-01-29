import { Icon } from "../common";

export type ConnectionState =
  | "waiting"
  | "connecting"
  | "connected"
  | "transferring"
  | "completed"
  | "error"
  | "paused";

export interface ConnectedPeer {
  id: string;
  name?: string;
  status: "downloading" | "paused" | "completed";
  progress: number;
  speed?: number; // bytes per second
  timeRemaining?: number; // seconds
}

interface ConnectionStatusProps {
  status: ConnectionState;
  message?: string;
  subMessage?: string;
  peers?: ConnectedPeer[];
}

const statusConfig = {
  waiting: {
    label: "Live",
    labelColor: "text-primary",
    icon: "wifi_tethering",
    defaultMessage: "Waiting for recipient...",
    defaultSubMessage: "Share the link to start transfer",
    showSpinner: true,
  },
  connecting: {
    label: "Connecting",
    labelColor: "text-yellow-400",
    icon: "sync",
    defaultMessage: "Establishing connection...",
    defaultSubMessage: "Please wait",
    showSpinner: true,
  },
  connected: {
    label: "Connected",
    labelColor: "text-green-400",
    icon: "wifi",
    defaultMessage: "Peer connected!",
    defaultSubMessage: "Ready to transfer",
    showSpinner: false,
  },
  transferring: {
    label: "Transferring",
    labelColor: "text-primary",
    icon: "swap_horiz",
    defaultMessage: "Transfer in progress...",
    defaultSubMessage: "Keep this tab open",
    showSpinner: true,
  },
  completed: {
    label: "Complete",
    labelColor: "text-green-400",
    icon: "check_circle",
    defaultMessage: "Transfer complete!",
    defaultSubMessage: "All files sent successfully",
    showSpinner: false,
  },
  error: {
    label: "Error",
    labelColor: "text-red-400",
    icon: "error",
    defaultMessage: "Connection lost",
    defaultSubMessage: "Please try again",
    showSpinner: false,
  },
  paused: {
    label: "Paused",
    labelColor: "text-yellow-400",
    icon: "pause",
    defaultMessage: "Transfer paused",
    defaultSubMessage: "Waiting for peer to resume",
    showSpinner: false,
  },
};

export function ConnectionStatus({
  status,
  message,
  subMessage,
  peers = [],
}: ConnectionStatusProps) {
  const config = statusConfig[status];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-300">Status</span>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                status === "error" ? "bg-red-400" : "bg-primary"
              } opacity-75`}
            />
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                status === "error" ? "bg-red-400" : "bg-primary"
              }`}
            />
          </span>
          <span
            className={`text-xs font-bold tracking-wide uppercase ${config.labelColor}`}
          >
            {config.label}
          </span>
        </div>
      </div>

      <div className="bg-[#0f2422] rounded-lg p-4 flex items-center gap-4 border border-border-dark">
        <div className="relative size-10 flex items-center justify-center">
          {config.showSpinner && (
            <svg
              className="animate-spin text-primary/30 w-full h-full absolute"
              fill="none"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                fill="currentColor"
              />
            </svg>
          )}
          <Icon
            name={config.icon}
            size="sm"
            className={`${config.showSpinner ? "absolute" : ""} text-primary`}
          />
        </div>

        <div className="flex flex-col">
          <span className="text-sm font-bold text-white">
            {message || config.defaultMessage}
          </span>
          <span className="text-xs text-gray-400">
            {subMessage || config.defaultSubMessage}
          </span>
        </div>
      </div>

      {/* Peer Progress List */}
      {peers.length > 0 && (
        <div className="mt-2 space-y-2">
          {peers.map((peer) => (
            <div key={peer.id} className="bg-surface-dark border border-white/5 rounded-lg p-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-gray-300">
                  {peer.name || "Device"} ({peer.status})
                </span>
                <span className="text-xs font-mono text-primary">
                  {peer.progress.toFixed(1)}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden mb-1">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    peer.status === "paused" ? "bg-yellow-500" : 
                    peer.status === "completed" ? "bg-green-500" : "bg-primary"
                  }`}
                  style={{ width: `${peer.progress}%` }}
                />
              </div>
              
              {peer.status === "downloading" && peer.speed !== undefined && (
                <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono">
                  <span>{(peer.speed / (1024 * 1024)).toFixed(1)} MB/s</span>
                  {peer.timeRemaining !== undefined && (
                    <span>
                      {peer.timeRemaining > 60 
                        ? `${Math.floor(peer.timeRemaining / 60)}:${(peer.timeRemaining % 60).toFixed(0).padStart(2, '0')}`
                        : `${peer.timeRemaining.toFixed(0)}s`} left
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
