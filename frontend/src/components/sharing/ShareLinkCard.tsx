import { useState } from "react";
import { Icon, Button } from "../common";
import { formatShareCode } from "../../lib/utils";

interface ShareLinkCardProps {
  shareLink: string;
  onCopy?: () => void;
  onShowQR?: () => void;
}

export function ShareLinkCard({
  shareLink,
  onCopy,
  onShowQR,
}: ShareLinkCardProps) {
  const [copied, setCopied] = useState(false);
  const formattedCode = formatShareCode(shareLink);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3">
        Share Code
      </h3>
      <div className="relative group bg-[#0f2422] border border-border-dark-alt rounded-lg p-4 mb-2">
        <div className="text-center">
          <div className="text-3xl font-mono font-bold text-primary tracking-[0.2em] select-all">
            {formattedCode}
          </div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mt-2">
            Share this code with the recipient
          </p>
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        <Button
          variant="primary"
          className="flex-1"
          size="md"
          icon={copied ? "check" : "content_copy"}
          onClick={handleCopy}
        >
          {copied ? "Copied!" : "Copy Code"}
        </Button>
        <button
          onClick={onShowQR}
          className="size-10 shrink-0 border border-border-dark-alt hover:border-primary bg-[#0f2422] rounded-lg flex items-center justify-center text-white hover:text-primary transition-colors"
        >
          <Icon name="qr_code_2" size="md" />
        </button>
      </div>
    </div>
  );
}
