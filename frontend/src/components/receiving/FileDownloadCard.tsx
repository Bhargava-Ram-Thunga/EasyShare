import { Icon, Button, ProgressBar } from "../common";
import { formatFileSize, getFileIcon, getFileTypeLabel } from "../../lib/utils";

interface FileDownloadCardProps {
  fileName: string;
  fileSize: number;
  fileType: string;
  progress: number;
  speed?: string;
  timeRemaining?: string;
  onPause?: () => void;
  onCancel?: () => void;
  isPaused?: boolean;
}

export function FileDownloadCard({
  fileName,
  fileSize,
  fileType,
  progress,
  speed = "45 MB/s",
  timeRemaining = "00:32",
  onPause,
  onCancel,
  isPaused = false,
}: FileDownloadCardProps) {
  const fileIcon = getFileIcon(fileType);
  const fileTypeLabel = getFileTypeLabel(fileType);

  return (
    <div className="group relative rounded-xl bg-surface-dark border border-white/5 shadow-glow hover:shadow-glow-strong transition-all duration-500 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

      <div className="p-3 md:p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="size-11 rounded-lg bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center shadow-inner relative overflow-hidden group-hover:border-primary/40 transition-colors">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Icon
                name={fileIcon}
                className="text-2xl text-primary drop-shadow-[0_0_8px_rgba(0,255,230,0.6)]"
              />
            </div>

            <div className="flex flex-col gap-0.5">
              <h3 className="text-white text-base font-bold tracking-tight group-hover:text-primary transition-colors">
                {fileName}
              </h3>
              <div className="flex items-center gap-1.5">
                <span className="text-gray-400 text-xs font-medium font-mono">
                  {formatFileSize(fileSize)}
                </span>
                <span className="w-1 h-1 rounded-full bg-gray-600" />
                <span className="text-gray-400 text-xs font-medium">
                  {fileTypeLabel}
                </span>
              </div>
            </div>
          </div>

          <div className="hidden sm:flex px-2 py-0.5 rounded border border-primary/30 bg-primary/5 items-center gap-1">
            <Icon name="lock" className="text-primary" size="sm" />
            <span className="text-primary text-xs font-bold tracking-wider uppercase">
              Encrypted
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-end">
            <span className="text-primary text-xl font-bold font-mono">
              {progress.toFixed(1)}
              <span className="text-sm text-primary/60">%</span>
            </span>
            <div className="flex flex-col items-end text-right">
              <span className="text-white text-xs font-medium font-mono">{speed}</span>
              <span className="text-gray-400 text-xs uppercase tracking-wider">
                Speed
              </span>
            </div>
          </div>

          <ProgressBar value={progress} size="sm" />

          <div className="flex justify-between items-center mt-0.5">
            <span className="text-gray-400 text-xs flex items-center gap-1.5">
              <Icon
                name="sync"
                size="sm"
                className={isPaused ? "" : "animate-spin"}
              />
              {isPaused ? "Paused" : "Syncing..."}
            </span>
            <span className="text-primary text-xs font-mono">
              {timeRemaining} left
            </span>
          </div>
        </div>

        <div className="flex gap-2.5">
          <Button
            variant="outline"
            className="flex-1 h-8 uppercase text-xs tracking-wide"
            icon={isPaused ? "play_arrow" : "pause"}
            onClick={onPause}
          >
            {isPaused ? "Resume" : "Pause"}
          </Button>
          <Button
            variant="danger"
            className="flex-1 h-8 uppercase text-xs tracking-wide border border-white/10"
            icon="close"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
