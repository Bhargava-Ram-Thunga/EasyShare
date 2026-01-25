import { Icon } from "../common";
import { formatFileSize, getFileIcon, getFileTypeLabel } from "../../lib/utils";

interface UpNextCardProps {
  fileName: string;
  fileSize: number;
  fileType: string;
  onDownload?: () => void;
}

export function UpNextCard({
  fileName,
  fileSize,
  fileType,
  onDownload,
}: UpNextCardProps) {
  const fileIcon = getFileIcon(fileType);
  const fileTypeLabel = getFileTypeLabel(fileType);

  return (
    <div className="opacity-60 hover:opacity-100 transition-opacity duration-300">
      <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1.5 ml-1">
        Up Next
      </p>
      <div className="rounded-lg bg-surface-dark/50 border border-white/5 p-2.5 flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="size-9 rounded bg-white/5 flex items-center justify-center">
            <Icon name={fileIcon} className="text-gray-400" size="sm" />
          </div>

          <div>
            <h4 className="text-white text-xs font-bold leading-tight">{fileName}</h4>
            <p className="text-gray-500 text-xs">
              {formatFileSize(fileSize)} • {fileTypeLabel}
            </p>
          </div>
        </div>

        <button
          onClick={onDownload}
          className="bg-primary/10 hover:bg-primary hover:text-black text-primary border border-primary/30 h-7 px-3 rounded font-bold text-xs uppercase tracking-wider transition-all duration-200"
        >
          Download
        </button>
      </div>
    </div>
  );
}
