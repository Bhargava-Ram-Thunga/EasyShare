import { Card } from "../common";
import { ShareLinkCard } from "./ShareLinkCard";
import { ConnectionStatus } from "./ConnectionStatus";
import { InfoTip } from "./InfoTip";

interface SharePanelProps {
  shareLink: string;
  connectionStatus:
    | "waiting"
    | "connecting"
    | "connected"
    | "transferring"
    | "error";
  onCopyLink?: () => void;
  onShowQR?: () => void;
}

export function SharePanel({
  shareLink,
  connectionStatus,
  onCopyLink,
  onShowQR,
}: SharePanelProps) {
  return (
    <div className="lg:col-span-5 flex flex-col gap-6">
      <Card variant="glow" className="flex flex-col gap-6 h-full">
        <ShareLinkCard
          shareLink={shareLink}
          onCopy={onCopyLink}
          onShowQR={onShowQR}
        />

        <div className="h-px bg-border-dark w-full my-1" />

        <ConnectionStatus status={connectionStatus} />
      </Card>

      <InfoTip icon="bolt" title="Peer-to-Peer Speed">
        Files are transferred directly between devices. Keep this tab open until
        the transfer is complete.
      </InfoTip>
    </div>
  );
}
