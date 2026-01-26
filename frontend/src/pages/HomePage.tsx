import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout, MarqueeBanner } from "../components/layout";
import {
  HeroBanner,
  DropZone,
  FileUploadCard,
  HowItWorks,
} from "../components/landing";
import { apiService } from "../services/api";

export function HomePage() {
  const navigate = useNavigate();
  const [uploadingFile, setUploadingFile] = useState<{
    name: string;
    size: number;
    progress: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;

      setError(null);
      setUploadingFile({
        name: files.length === 1 ? files[0].name : `${files.length} files`,
        size: files.reduce((acc, f) => acc + f.size, 0),
        progress: 0,
      });

      try {
        // Simulate upload progress
        let progress = 0;
        const progressInterval = setInterval(() => {
          progress += Math.random() * 20;
          if (progress >= 90) {
            progress = 90;
            clearInterval(progressInterval);
          }
          setUploadingFile((prev) =>
            prev ? { ...prev, progress: Math.min(progress, 100) } : null
          );
        }, 150);

        // Create share in backend
        const fileItems = files.map((f) => ({
          id: `${f.name}-${f.size}-${Date.now()}`,
          name: f.name,
          size: f.size,
          type: f.type || "application/octet-stream",
        }));

        const shareResponse = await apiService.createShare(fileItems);

        clearInterval(progressInterval);
        setUploadingFile((prev) =>
          prev ? { ...prev, progress: 100 } : null
        );

        // Navigate to share page with share data
        setTimeout(() => {
          navigate("/share", {
            state: {
              files,
              shareData: shareResponse,
            },
          });
        }, 500);
      } catch (err) {
        console.error("Failed to create share:", err);
        setError(err instanceof Error ? err.message : "Failed to create share");
        setUploadingFile(null);
      }
    },
    [navigate]
  );

  return (
    <PageLayout
      headerVariant="default"
      footerVariant="default"
      className="flex flex-col"
    >
      <section className="flex-grow flex flex-col items-center justify-center w-full px-6 lg:px-12 py-12">
        <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-16 items-center">
          <HeroBanner />

          <div id="dropzone-section" className="relative w-full flex flex-col gap-6">
            <DropZone onFilesSelected={handleFilesSelected} />

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {uploadingFile && (
              <FileUploadCard
                fileName={uploadingFile.name}
                fileSize={uploadingFile.size}
                progress={Math.round(uploadingFile.progress)}
                onCancel={() => setUploadingFile(null)}
              />
            )}
          </div>
        </div>
      </section>

      <HowItWorks />

      <MarqueeBanner />
    </PageLayout>
  );
}
