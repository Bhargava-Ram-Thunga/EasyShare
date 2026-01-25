import { useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { PageLayout } from "../components/layout";
import { FileQueue, type FileItem } from "../components/fileManagement";
import { SharePanel } from "../components/sharing";
import { generateShareCode } from "../lib/utils";

const fileToFileItem = (file: File): FileItem => ({
  id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
  name: file.name,
  size: file.size,
  type: file.type || "application/octet-stream",
});

export function SharePage() {
  const location = useLocation();
  const initialFiles = (location.state?.files as File[]) || [];

  const [files, setFiles] = useState<FileItem[]>(
    initialFiles.map(fileToFileItem),
  );
  const [shareCode] = useState(generateShareCode());
  const [connectionStatus] = useState<
    "waiting" | "connecting" | "connected" | "transferring" | "error"
  >("waiting");

  const handleRemoveFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const handleClearAll = useCallback(() => {
    setFiles([]);
  }, []);

  const handleAddMore = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      const newFiles = Array.from(target.files || []).map(fileToFileItem);
      setFiles((prev) => [...prev, ...newFiles]);
    };
    input.click();
  }, []);

  return (
    <PageLayout
      headerVariant="glass"
      className="flex flex-col items-center justify-center py-4 px-4 min-h-[calc(100vh-140px)]"
      navItems={[
        { to: "/receive", label: "Receive" },
        { to: "/files", label: "Files" },
        { to: "/history", label: "History" },
      ]}
    >
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent-amber/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 grid w-full max-w-4xl grid-cols-1 gap-4 lg:grid-cols-12">
        <FileQueue
          files={files}
          onRemoveFile={handleRemoveFile}
          onClearAll={handleClearAll}
          onAddMore={handleAddMore}
        />

        <SharePanel shareLink={shareCode} connectionStatus={connectionStatus} />
      </div>
    </PageLayout>
  );
}
