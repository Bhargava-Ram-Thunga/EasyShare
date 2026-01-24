import { Icon } from "../common";
import { formatFileSize } from "../../lib/utils";

interface FileUploadCardProps {
  fileName: string;
  fileSize: number;
  progress: number;
  onCancel?: () => void;
}

export function FileUploadCard({
  fileName,
  fileSize,
  progress,
  onCancel,
}: FileUploadCardProps) {
  return (
    <div className="glass-panel p-4 rounded-xl border border-white/10 flex items-center gap-4 animate-[fadeIn_0.5s_ease-out]">
      <div className="h-12 w-12 rounded bg-surface-darker flex items-center justify-center border border-white/5 shrink-0">
        <Icon name="picture_as_pdf" className="text-red-400" size="lg" />
      </div>

      <div className="flex-grow min-w-0">
        <div className="flex justify-between items-center mb-1">
          <h4 className="text-white text-sm font-medium truncate">
            {fileName}
          </h4>
          <span className="text-primary text-xs font-bold">{progress}%</span>
        </div>
        <div className="w-full bg-surface-darker rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-primary h-full rounded-full shadow-[0_0_10px_rgba(0,255,230,0.5)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-gray-500 font-mono">
          <span>{formatFileSize(fileSize)}</span>
          <span>{progress < 100 ? "Uploading..." : "Complete"}</span>
        </div>
      </div>

      {onCancel && (
        <button
          onClick={onCancel}
          className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <Icon name="close" size="sm" />
        </button>
      )}
    </div>
  );
}
