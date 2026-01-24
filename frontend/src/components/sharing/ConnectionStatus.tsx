import { Icon } from "../common";

type ConnectionState =
  | "waiting"
  | "connecting"
  | "connected"
  | "transferring"
  | "error";

interface ConnectionStatusProps {
  status: ConnectionState;
  message?: string;
  subMessage?: string;
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
  error: {
    label: "Error",
    labelColor: "text-red-400",
    icon: "error",
    defaultMessage: "Connection lost",
    defaultSubMessage: "Please try again",
    showSpinner: false,
  },
};

export function ConnectionStatus({
  status,
  message,
  subMessage,
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
    </div>
  );
}
