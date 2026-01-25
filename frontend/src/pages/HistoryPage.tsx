import { useState } from 'react';
import { PageLayout } from '../components/layout';
import { Card, Icon, Badge } from '../components/common';
import { formatFileSize } from '../lib/utils';

interface TransferRecord {
  id: string;
  type: 'sent' | 'received';
  fileName: string;
  fileSize: number;
  timestamp: Date;
  peer: string;
  status: 'completed' | 'failed' | 'cancelled';
  speed?: string;
}

const mockHistory: TransferRecord[] = [
  {
    id: '1',
    type: 'sent',
    fileName: 'Project Presentation.pdf',
    fileSize: 2457600,
    timestamp: new Date(2026, 0, 23, 14, 30),
    peer: '192.168.1.xxx',
    status: 'completed',
    speed: '5.2 MB/s',
  },
  {
    id: '2',
    type: 'received',
    fileName: 'design-mockups.fig',
    fileSize: 8934567,
    timestamp: new Date(2026, 0, 23, 10, 15),
    peer: '192.168.1.xxx',
    status: 'completed',
    speed: '8.1 MB/s',
  },
  {
    id: '3',
    type: 'sent',
    fileName: 'vacation-photos.zip',
    fileSize: 45678900,
    timestamp: new Date(2026, 0, 22, 16, 45),
    peer: '192.168.1.xxx',
    status: 'completed',
    speed: '12.3 MB/s',
  },
  {
    id: '4',
    type: 'sent',
    fileName: 'large-dataset.csv',
    fileSize: 123456789,
    timestamp: new Date(2026, 0, 21, 9, 20),
    peer: '192.168.1.xxx',
    status: 'failed',
  },
  {
    id: '5',
    type: 'received',
    fileName: 'demo-video.mp4',
    fileSize: 12345678,
    timestamp: new Date(2026, 0, 20, 18, 10),
    peer: '192.168.1.xxx',
    status: 'completed',
    speed: '6.7 MB/s',
  },
];

export function HistoryPage() {
  const [history] = useState<TransferRecord[]>(mockHistory);
  const [filter, setFilter] = useState<'all' | 'sent' | 'received'>('all');

  const filteredHistory = history.filter((record) => {
    if (filter === 'all') return true;
    return record.type === filter;
  });

  const getStatusBadge = (status: TransferRecord['status']) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="success" size="sm">
            Completed
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="warning" size="sm">
            Failed
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="secondary" size="sm">
            Cancelled
          </Badge>
        );
    }
  };

  const totalSent = history
    .filter((r) => r.type === 'sent' && r.status === 'completed')
    .reduce((acc, r) => acc + r.fileSize, 0);

  const totalReceived = history
    .filter((r) => r.type === 'received' && r.status === 'completed')
    .reduce((acc, r) => acc + r.fileSize, 0);

  return (
    <PageLayout
      headerVariant="glass"
      footerVariant="default"
      navItems={[
        { to: "/", label: "Share" },
        { to: "/receive", label: "Receive" },
        { to: "/files", label: "Files" },
      ]}
    >
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
            Transfer History
          </h1>
          <p className="text-gray-400 mb-8">
            View all your past file transfers and sharing activity
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card variant="glow" padding="md">
              <div className="flex items-center gap-4">
                <div className="size-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary border border-primary/20">
                  <Icon name="upload" size="lg" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                    Total Sent
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {formatFileSize(totalSent)}
                  </p>
                </div>
              </div>
            </Card>

            <Card variant="glow" padding="md">
              <div className="flex items-center gap-4">
                <div className="size-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary border border-primary/20">
                  <Icon name="download" size="lg" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                    Total Received
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {formatFileSize(totalReceived)}
                  </p>
                </div>
              </div>
            </Card>

            <Card variant="glow" padding="md">
              <div className="flex items-center gap-4">
                <div className="size-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary border border-primary/20">
                  <Icon name="swap_horiz" size="lg" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                    Total Transfers
                  </p>
                  <p className="text-2xl font-bold text-white">{history.length}</p>
                </div>
              </div>
            </Card>
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
              All Activity
            </button>
            <button
              onClick={() => setFilter('sent')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                filter === 'sent'
                  ? 'bg-primary text-background-dark'
                  : 'bg-surface-dark text-gray-400 hover:text-white border border-border-dark'
              }`}
            >
              Sent
            </button>
            <button
              onClick={() => setFilter('received')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                filter === 'received'
                  ? 'bg-primary text-background-dark'
                  : 'bg-surface-dark text-gray-400 hover:text-white border border-border-dark'
              }`}
            >
              Received
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {filteredHistory.map((record) => (
            <Card key={record.id} variant="default" padding="none">
              <div className="p-6 flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div
                    className={`size-12 rounded-lg flex items-center justify-center border shrink-0 ${
                      record.type === 'sent'
                        ? 'bg-primary/10 text-primary border-primary/20'
                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }`}
                  >
                    <Icon
                      name={record.type === 'sent' ? 'upload' : 'download'}
                      size="lg"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h3 className="text-base font-bold text-white truncate">
                        {record.fileName}
                      </h3>
                      {getStatusBadge(record.status)}
                    </div>
                    <p className="text-sm text-gray-400 font-mono">
                      {formatFileSize(record.fileSize)} •{' '}
                      {record.type === 'sent' ? 'Sent to' : 'Received from'}{' '}
                      {record.peer}
                      {record.speed && ` • ${record.speed}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 md:justify-end">
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">
                      {record.timestamp.toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-400 font-mono">
                      {record.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredHistory.length === 0 && (
          <Card className="text-center py-20">
            <Icon
              name="history"
              className="text-6xl text-gray-600 mb-4 mx-auto"
            />
            <h3 className="text-xl font-bold text-white mb-2">
              No transfer history
            </h3>
            <p className="text-gray-400">
              {filter === 'all'
                ? 'Start sharing files to see your transfer history'
                : `No ${filter} transfers to display`}
            </p>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}