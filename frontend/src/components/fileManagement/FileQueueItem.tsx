import { Icon } from "../common";
import { formatFileSize, getFileIcon, getFileTypeLabel } from "../../lib/utils";

export interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
}

interface FileQueueItemProps {
  file: FileItem;
  onRemove: (id: string) => void;
}

export function FileQueueItem({ file, onRemove }: FileQueueItemProps) {
  const fileIcon = getFileIcon(file.type);
  const fileTypeLabel = getFileTypeLabel(file.type);

  return (
    <div className="group flex items-center gap-4 bg-[#0f2422] p-3 rounded-lg border border-transparent hover:border-primary/30 transition-all duration-300">
      <div className="shrink-0 size-12 bg-border-dark rounded-lg flex items-center justify-center text-primary border border-border-dark-alt">
        <Icon name={fileIcon} size="lg" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold truncate text-white">{file.name}</p>
        <p className="text-xs text-gray-400 font-mono mt-0.5">
          {formatFileSize(file.size)} • {fileTypeLabel}
        </p>
      </div>

      <button
        onClick={() => onRemove(file.id)}
        className="shrink-0 size-8 flex items-center justify-center rounded hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors"
      >
        <Icon name="close" size="sm" />
      </button>
    </div>
  );
}
