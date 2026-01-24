import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout, MarqueeBanner } from "../components/layout";
import {
  HeroBanner,
  DropZone,
  FileUploadCard,
  HowItWorks,
} from "../components/landing";

export function HomePage() {
  const navigate = useNavigate();
  const [uploadingFile, setUploadingFile] = useState<{
    name: string;
    size: number;
    progress: number;
  } | null>(null);

  const handleFilesSelected = useCallback(
    (files: File[]) => {
      if (files.length > 0) {
        setUploadingFile({
          name: files[0].name,
          size: files[0].size,
          progress: 0,
        });

        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 15;
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setTimeout(() => {
              navigate("/share", { state: { files } });
            }, 500);
          }
          setUploadingFile((prev) =>
            prev ? { ...prev, progress: Math.min(progress, 100) } : null,
          );
        }, 200);
      }
    },
    [navigate],
  );

  return (
    <PageLayout
      headerVariant="default"
      footerVariant="minimal"
      className="flex flex-col"
    >
      <section className="flex-grow flex flex-col items-center justify-center w-full px-6 lg:px-12 py-12">
        <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-16 items-center">
          <HeroBanner />

          <div id="dropzone-section" className="relative w-full flex flex-col gap-6">
            <DropZone onFilesSelected={handleFilesSelected} />

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
