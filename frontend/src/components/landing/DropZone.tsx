import { useCallback, useState, type DragEvent, type ChangeEvent } from "react";
import { Icon } from "../common";
import { cn } from "../../lib/utils";

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  className?: string;
  disabled?: boolean;
}

export function DropZone({
  onFilesSelected,
  className,
  disabled = false,
}: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragging(true);
      }
    },
    [disabled],
  );

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        onFilesSelected(files);
      }
    },
    [onFilesSelected, disabled],
  );

  const handleFileInput = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        onFilesSelected(files);
      }
      e.target.value = "";
    },
    [onFilesSelected],
  );

  return (
    <div
      className={cn(
        "group relative w-full aspect-[4/3] rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center overflow-hidden cursor-pointer",
        isDragging
          ? "border-primary bg-primary/10 scale-[1.02]"
          : "border-primary/30 bg-surface-dark/50 hover:bg-surface-dark hover:border-primary",
        "neon-border",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() =>
        !disabled && document.getElementById("file-input")?.click()
      }
    >
      <input
        id="file-input"
        type="file"
        multiple
        className="hidden"
        onChange={handleFileInput}
        disabled={disabled}
      />

      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,230,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,230,0.03)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_70%)]" />

      <div className="relative z-10 flex flex-col items-center gap-6 p-8 transition-transform duration-300 group-hover:scale-105">
        <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-surface-dark to-black border border-primary/20 flex items-center justify-center shadow-2xl group-hover:shadow-[0_0_30px_rgba(0,255,230,0.15)] transition-shadow">
          <Icon
            name="cloud_upload"
            className="text-6xl text-primary drop-shadow-[0_0_10px_rgba(0,255,230,0.5)]"
          />
        </div>

        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-2">
            {isDragging ? "Drop to upload" : "Drop files to upload"}
          </h3>
          <p className="text-gray-400">or click to browse local files</p>
        </div>

        <span className="text-xs text-primary/60 font-mono border border-primary/20 px-3 py-1 rounded">
          MAX FILE SIZE: UNLIMITED
        </span>
      </div>
    </div>
  );
}
