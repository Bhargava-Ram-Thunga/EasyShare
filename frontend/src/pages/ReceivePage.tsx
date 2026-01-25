import { useState } from "react";
import { useParams } from "react-router-dom";
import { PageLayout } from "../components/layout";
import {
  CodeInputCard,
  ReceivingHeader,
  FileDownloadCard,
  UpNextCard,
  SecurityFooter,
} from "../components/receiving";

export function ReceivePage() {
  const { linkId } = useParams<{ linkId?: string }>();
  const [enteredCode, setEnteredCode] = useState<string | null>(linkId || null);
  const [isPaused, setIsPaused] = useState(false);
  const [progress] = useState(65);

  const handleCodeSubmit = (code: string) => {
    console.log("Code entered:", code);
    setEnteredCode(code);
    // TODO: Connect to peer using this code
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleCancel = () => {
    console.log("Transfer cancelled");
    setEnteredCode(null);
  };

  return (
    <PageLayout
      headerVariant="glass"
      className="flex items-center justify-center px-4 py-6 min-h-[calc(100vh-140px)]"
      navItems={[
        { to: "/", label: "Share" },
        { to: "/files", label: "Files" },
        { to: "/history", label: "History" },
      ]}
    >
      <div className="w-full max-w-[580px] flex flex-col gap-4 my-auto">
        {!enteredCode ? (
          <CodeInputCard onCodeSubmit={handleCodeSubmit} />
        ) : (
          <>
            <ReceivingHeader />

            <FileDownloadCard
              fileName="Project_Alpha_v2.zip"
              fileSize={2.4 * 1024 * 1024 * 1024}
              fileType="application/zip"
              progress={progress}
              speed="45 MB/s"
              timeRemaining="00:32"
              isPaused={isPaused}
              onPause={handlePause}
              onCancel={handleCancel}
            />

            <UpNextCard
              fileName="Design_Assets_Q3.pdf"
              fileSize={12 * 1024 * 1024}
              fileType="application/pdf"
              onDownload={() => console.log("Download next file")}
            />

            <SecurityFooter />
          </>
        )}
      </div>
    </PageLayout>
  );
}
