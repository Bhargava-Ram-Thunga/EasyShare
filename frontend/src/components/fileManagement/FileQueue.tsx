import { Icon, Badge, Card } from "../common";
import { FileQueueItem, type FileItem } from "./FileQueueItem";
import { formatFileSize } from "../../lib/utils";

interface FileQueueProps {
  files: FileItem[];
  onRemoveFile: (id: string) => void;
  onClearAll: () => void;
  onAddMore: () => void;
}

export function FileQueue({
  files,
  onRemoveFile,
  onClearAll,
  onAddMore,
}: FileQueueProps) {
  const totalSize = files.reduce((acc, file) => acc + file.size, 0);

  return (
    <div className="lg:col-span-7 flex flex-col gap-6">
      <Card className="shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold uppercase tracking-wide text-white">
            Ready to Share
          </h2>
          <Badge variant="primary" size="md">
            P2P Secure
          </Badge>
        </div>
        <p className="text-gray-400 text-sm">
          {files.length} file{files.length !== 1 ? "s" : ""} added to the queue
          ({formatFileSize(totalSize)} Total)
        </p>
      </Card>

      <div className="bg-surface-dark border border-border-dark rounded-xl flex flex-col overflow-hidden shadow-xl h-full min-h-[300px]">
        <div className="px-6 py-4 border-b border-border-dark bg-[#122927] flex justify-between items-center">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
            File Queue
          </span>
          <button
            onClick={onClearAll}
            className="text-xs font-bold text-accent-amber hover:text-white transition-colors uppercase"
          >
            Clear All
          </button>
        </div>

        <div className="overflow-y-auto flex-1 max-h-[400px] p-2 space-y-2">
          {files.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-gray-500">
              <Icon name="folder_open" className="text-4xl mb-2 opacity-50" />
              <p className="text-sm">No files added yet</p>
            </div>
          ) : (
            files.map((file) => (
              <FileQueueItem
                key={file.id}
                file={file}
                onRemove={onRemoveFile}
              />
            ))
          )}
        </div>

        <div className="p-4 border-t border-border-dark bg-[#122927]">
          <button
            onClick={onAddMore}
            className="w-full border border-dashed border-border-dark-alt rounded-lg py-3 text-sm font-medium text-gray-400 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
          >
            <Icon name="add" size="sm" />
            Add more files
          </button>
        </div>
      </div>
    </div>
  );
}
