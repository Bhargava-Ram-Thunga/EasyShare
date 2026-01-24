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

      <div className="p-6 md:p-8 flex flex-col gap-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-5">
            <div className="size-16 rounded-lg bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center shadow-inner relative overflow-hidden group-hover:border-primary/40 transition-colors">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Icon
                name={fileIcon}
                className="text-4xl text-primary drop-shadow-[0_0_8px_rgba(0,255,230,0.6)]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="text-white text-2xl font-bold tracking-tight group-hover:text-primary transition-colors">
                {fileName}
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-sm font-medium font-mono">
                  {formatFileSize(fileSize)}
                </span>
                <span className="w-1 h-1 rounded-full bg-gray-600" />
                <span className="text-gray-400 text-sm font-medium">
                  {fileTypeLabel}
                </span>
              </div>
            </div>
          </div>

          <div className="hidden sm:flex px-3 py-1 rounded border border-primary/30 bg-primary/5 items-center gap-2">
            <Icon name="lock" className="text-primary" size="sm" />
            <span className="text-primary text-xs font-bold tracking-wider uppercase">
              End-to-End Encrypted
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-end">
            <span className="text-primary text-3xl font-bold font-mono">
              {progress}
              <span className="text-lg text-primary/60">%</span>
            </span>
            <div className="flex flex-col items-end text-right">
              <span className="text-white font-medium font-mono">{speed}</span>
              <span className="text-gray-400 text-xs uppercase tracking-wider">
                Speed
              </span>
            </div>
          </div>

          <ProgressBar value={progress} size="md" />

          <div className="flex justify-between items-center mt-1">
            <span className="text-gray-400 text-sm flex items-center gap-2">
              <Icon
                name="sync"
                size="sm"
                className={isPaused ? "" : "animate-spin"}
              />
              {isPaused ? "Paused" : "Syncing chunks..."}
            </span>
            <span className="text-primary text-sm font-mono">
              {timeRemaining} remaining
            </span>
          </div>
        </div>

        <div className="flex gap-4 mt-2">
          <Button
            variant="outline"
            className="flex-1 h-12 uppercase text-sm tracking-wide"
            icon={isPaused ? "play_arrow" : "pause"}
            onClick={onPause}
          >
            {isPaused ? "Resume" : "Pause"}
          </Button>
          <Button
            variant="danger"
            className="flex-1 h-12 uppercase text-sm tracking-wide border border-white/10"
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
