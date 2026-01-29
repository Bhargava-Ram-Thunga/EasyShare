import { Card } from "../common";
import { ShareLinkCard } from "./ShareLinkCard";
import { ConnectionStatus, type ConnectedPeer } from "./ConnectionStatus";
import { InfoTip } from "./InfoTip";

interface SharePanelProps {
  shareLink: string;
  connectionStatus:
    | "waiting"
    | "connecting"
    | "connected"
    | "transferring"
    | "completed"
    | "error";
  peers?: ConnectedPeer[];
  onCopyLink?: () => void;
  onShowQR?: () => void;
}

export function SharePanel({
  shareLink,
  connectionStatus,
  peers = [],
  onCopyLink,
  onShowQR,
}: SharePanelProps) {
  return (
    <div className="lg:col-span-5 flex flex-col gap-3">
      <Card variant="glow" className="flex flex-col gap-4 h-full">
        <ShareLinkCard
          shareLink={shareLink}
          onCopy={onCopyLink}
          onShowQR={onShowQR}
        />

        <div className="h-px bg-border-dark w-full" />

        <ConnectionStatus status={connectionStatus} peers={peers} />
      </Card>

      <InfoTip icon="bolt" title="Peer-to-Peer Speed">
        Files are transferred directly between devices. Keep this tab open until
        the transfer is complete.
      </InfoTip>
    </div>
  );
}
