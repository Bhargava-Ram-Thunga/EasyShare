import { useState } from 'react';
import { PageLayout } from '../components/layout';
import { Card, Icon, Badge, Button } from '../components/common';
import { formatFileSize, getFileIcon, getFileTypeLabel } from '../lib/utils';

interface FileRecord {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  shareLink?: string;
  downloads: number;
  status: 'active' | 'expired' | 'deleted';
}

const mockFiles: FileRecord[] = [
  {
    id: '1',
    name: 'Project Presentation.pdf',
    size: 2457600,
    type: 'application/pdf',
    uploadedAt: new Date(2026, 0, 23),
    shareLink: 'https://easyshare.app/d/abc123',
    downloads: 5,
    status: 'active',
  },
  {
    id: '2',
    name: 'vacation-photos.zip',
    size: 45678900,
    type: 'application/zip',
    uploadedAt: new Date(2026, 0, 22),
    shareLink: 'https://easyshare.app/d/xyz789',
    downloads: 2,
    status: 'active',
  },
  {
    id: '3',
    name: 'demo-video.mp4',
    size: 12345678,
    type: 'video/mp4',
    uploadedAt: new Date(2026, 0, 20),
    downloads: 12,
    status: 'expired',
  },
];

export function FilesPage() {
  const [files] = useState<FileRecord[]>(mockFiles);
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all');

  const filteredFiles = files.filter((file) => {
    if (filter === 'all') return true;
    return file.status === filter;
  });

  const handleCopyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <PageLayout headerVariant="default" footerVariant="default">
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
                My Files
              </h1>
              <p className="text-gray-400">
                Manage and track all your shared files in one place
              </p>
            </div>
            <Button
              variant="primary"
              size="lg"
              icon="add"
              onClick={() => (window.location.href = '/')}
            >
              Share New File
            </Button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                filter === 'all'
                  ? 'bg-primary text-background-dark'
                  : 'bg-surface-dark text-gray-400 hover:text-white border border-border-dark'
              }`}
            >
              All Files
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                filter === 'active'
                  ? 'bg-primary text-background-dark'
                  : 'bg-surface-dark text-gray-400 hover:text-white border border-border-dark'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('expired')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                filter === 'expired'
                  ? 'bg-primary text-background-dark'
                  : 'bg-surface-dark text-gray-400 hover:text-white border border-border-dark'
              }`}
            >
              Expired
            </button>
          </div>
        </div>

        {filteredFiles.length === 0 ? (
          <Card className="text-center py-20">
            <Icon
              name="folder_open"
              className="text-6xl text-gray-600 mb-4 mx-auto"
            />
            <h3 className="text-xl font-bold text-white mb-2">
              No files found
            </h3>
            <p className="text-gray-400 mb-6">
              {filter === 'all'
                ? 'Start sharing files to see them here'
                : `No ${filter} files to display`}
            </p>
            <Button
              variant="primary"
              icon="add"
              onClick={() => (window.location.href = '/')}
            >
              Share Your First File
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredFiles.map((file) => (
              <Card key={file.id} variant="default" padding="none">
                <div className="p-6 flex flex-col md:flex-row md:items-center gap-6">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="size-14 bg-border-dark rounded-lg flex items-center justify-center text-primary border border-border-dark-alt shrink-0">
                      <Icon name={getFileIcon(file.type)} size="lg" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-bold text-white truncate">
                          {file.name}
                        </h3>
                        <Badge
                          variant={
                            file.status === 'active' ? 'success' : 'secondary'
                          }
                          size="sm"
                        >
                          {file.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400 font-mono">
                        {formatFileSize(file.size)} • {getFileTypeLabel(file.type)} •{' '}
                        {file.uploadedAt.toLocaleDateString()} • {file.downloads}{' '}
                        download{file.downloads !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {file.shareLink && file.status === 'active' && (
                      <Button
                        variant="outline"
                        size="md"
                        icon="content_copy"
                        onClick={() => handleCopyLink(file.shareLink!)}
                      >
                        Copy Link
                      </Button>
                    )}
                    <button className="size-10 flex items-center justify-center rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                      <Icon name="more_vert" size="md" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}