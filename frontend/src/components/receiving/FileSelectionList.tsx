import { useState } from "react";
import { Icon, Button, Card } from "../common";
import { formatFileSize, getFileIcon, getFileTypeLabel } from "../../lib/utils";

interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
}

interface FileSelectionListProps {
  files: FileItem[];
  onDownloadSelected: (selectedFiles: FileItem[]) => void;
  onCancel: () => void;
}

export function FileSelectionList({
  files,
  onDownloadSelected,
  onCancel,
}: FileSelectionListProps) {
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(
    new Set(files.map((f) => f.id))
  );

  const toggleFile = (fileId: string) => {
    setSelectedFiles((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  const toggleAll = () => {
    if (selectedFiles.size === files.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(files.map((f) => f.id)));
    }
  };

  const handleDownload = () => {
    const filesToDownload = files.filter((f) => selectedFiles.has(f.id));
    onDownloadSelected(filesToDownload);
  };

  const totalSelectedSize = files
    .filter((f) => selectedFiles.has(f.id))
    .reduce((sum, f) => sum + f.size, 0);

  const allSelected = selectedFiles.size === files.length;
  const noneSelected = selectedFiles.size === 0;

  return (
    <Card variant="glow" padding="none">
      <div className="p-4 border-b border-border-dark-alt">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-white">Select Files to Download</h3>
          <button
            onClick={toggleAll}
            className="text-xs font-bold text-primary hover:text-primary/80 uppercase tracking-wider transition-colors"
          >
            {allSelected ? "Deselect All" : "Select All"}
          </button>
        </div>
        <p className="text-sm text-gray-400">
          {selectedFiles.size} of {files.length} file{files.length !== 1 ? "s" : ""} selected
          {selectedFiles.size > 0 && ` (${formatFileSize(totalSelectedSize)})`}
        </p>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {files.map((file) => {
          const isSelected = selectedFiles.has(file.id);
          const fileIcon = getFileIcon(file.type);
          const fileTypeLabel = getFileTypeLabel(file.type);

          return (
            <div
              key={file.id}
              onClick={() => toggleFile(file.id)}
              className={`
                p-4 border-b border-border-dark-alt cursor-pointer transition-all
                ${isSelected ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-white/5"}
              `}
            >
              <div className="flex items-center gap-3">
                {/* Checkbox */}
                <div
                  className={`
                    size-5 rounded border-2 flex items-center justify-center shrink-0 transition-all
                    ${
                      isSelected
                        ? "bg-primary border-primary"
                        : "border-gray-600 hover:border-primary/50"
                    }
                  `}
                >
                  {isSelected && <Icon name="check" size="sm" className="text-background-dark" />}
                </div>

                {/* File Icon */}
                <div className="size-10 rounded-lg bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center shrink-0">
                  <Icon name={fileIcon} className="text-lg text-primary" />
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white truncate">{file.name}</h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs text-gray-400 font-mono">
                      {formatFileSize(file.size)}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-gray-600" />
                    <span className="text-xs text-gray-400">{fileTypeLabel}</span>
                  </div>
                </div>

                {/* Selection indicator */}
                {isSelected && (
                  <div className="shrink-0 px-2 py-1 rounded bg-primary/10 border border-primary/30">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">
                      Selected
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-border-dark-alt bg-[#0f2422]">
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onCancel}
            icon="close"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleDownload}
            disabled={noneSelected}
            icon="download"
          >
            Download {selectedFiles.size > 0 && `(${selectedFiles.size})`}
          </Button>
        </div>

        {noneSelected && (
          <p className="text-xs text-center text-red-400 mt-2">
            Please select at least one file to download
          </p>
        )}
      </div>
    </Card>
  );
}
