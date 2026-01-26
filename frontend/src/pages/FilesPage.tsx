import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/layout';
import { Card, Icon, Badge, Button } from '../components/common';
import { formatFileSize, getFileIcon, getFileTypeLabel } from '../lib/utils';
import { apiService } from '../services/api';
import type { FileRecord } from '../services/api';

export function FilesPage() {
  const navigate = useNavigate();
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('active'); // Default to active tab
  const [loading, setLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  useEffect(() => {
    setLoading(true);
    const statusFilter = filter === 'all' ? undefined : filter;
    console.log('Fetching files with filter:', filter, 'statusFilter:', statusFilter);

    // Clear selection when filter changes
    setSelectedFiles(new Set());
    setSelectionMode(false);

    apiService
      .getFiles(50, 0, statusFilter)
      .then((fetchedFiles) => {
        console.log('Fetched files:', fetchedFiles.length, 'files for filter:', filter);
        setFiles(fetchedFiles);
      })
      .catch((err) => {
        console.error('Failed to fetch files:', err);
        setFiles([]);
      })
      .finally(() => setLoading(false));
  }, [filter]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredFiles = files;

  const handleCopyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShareAgain = async (file: FileRecord) => {
    try {
      // Create file metadata array for the share
      const fileItems = [{
        id: file.id,
        name: file.name,
        size: file.size,
        type: file.type
      }];

      // Create a new share with the same file
      const shareResponse = await apiService.createShare(fileItems);

      // Navigate to share page with the new share code AND file metadata
      navigate('/share', {
        state: {
          files: fileItems, // Pass file metadata so FileQueue can display them
          shareData: shareResponse
        }
      });
    } catch (err) {
      console.error('Failed to create new share:', err);
      alert('Failed to create new share. Please try again.');
    }
    setOpenDropdown(null);
  };

  const handleDeleteFile = async (fileId: string) => {
    const isHardDelete = filter === 'expired';
    const confirmMessage = isHardDelete
      ? 'Are you sure you want to permanently delete this file? This cannot be undone.'
      : 'Are you sure you want to delete this file?';

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      await apiService.deleteFile(fileId, isHardDelete);
      console.log(`File ${isHardDelete ? 'permanently deleted' : 'marked as expired'}:`, fileId);

      // Refresh the entire file list from the server to get updated statuses
      setLoading(true);
      const statusFilter = filter === 'all' ? undefined : filter;
      const fetchedFiles = await apiService.getFiles(50, 0, statusFilter);
      setFiles(fetchedFiles);
      setLoading(false);
    } catch (err) {
      console.error('Failed to delete file:', err);
      alert('Failed to delete file. Please try again.');
      setLoading(false);
    }
    setOpenDropdown(null);
  };

  const toggleDropdown = (fileId: string) => {
    setOpenDropdown(openDropdown === fileId ? null : fileId);
  };

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedFiles(new Set());
  };

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedFiles.size === files.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(files.map(f => f.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedFiles.size === 0) {
      return;
    }

    const isHardDelete = filter === 'expired';
    const confirmMessage = isHardDelete
      ? `Are you sure you want to permanently delete ${selectedFiles.size} file(s)? This cannot be undone.`
      : `Are you sure you want to delete ${selectedFiles.size} file(s)?`;

    if (!confirm(confirmMessage)) {
      return;
    }

    setLoading(true);

    try {
      // Delete all selected files
      await Promise.all(
        Array.from(selectedFiles).map(fileId => apiService.deleteFile(fileId, isHardDelete))
      );

      console.log(`Successfully ${isHardDelete ? 'permanently deleted' : 'marked as expired'} ${selectedFiles.size} file(s)`);

      // Refresh the file list
      const statusFilter = filter === 'all' ? undefined : filter;
      const fetchedFiles = await apiService.getFiles(50, 0, statusFilter);
      setFiles(fetchedFiles);

      // Exit selection mode
      setSelectionMode(false);
      setSelectedFiles(new Set());
    } catch (err) {
      console.error('Failed to delete files:', err);
      alert('Failed to delete some files. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout
      headerVariant="glass"
      footerVariant="default"
      navItems={[
        { to: "/receive", label: "Receive" },
        { to: "/history", label: "History" },
      ]}
    >
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
            <div className="flex gap-3">
              {selectionMode ? (
                <>
                  <Button
                    variant="outline"
                    size="lg"
                    icon="close"
                    onClick={toggleSelectionMode}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    icon="delete"
                    onClick={handleBulkDelete}
                    disabled={selectedFiles.size === 0}
                  >
                    Delete Selected ({selectedFiles.size})
                  </Button>
                </>
              ) : (
                <>
                  {files.length > 0 && (
                    <Button
                      variant="outline"
                      size="lg"
                      icon="delete_sweep"
                      onClick={toggleSelectionMode}
                    >
                      Clear Files
                    </Button>
                  )}
                  <Button
                    variant="primary"
                    size="lg"
                    icon="add"
                    onClick={() => (window.location.href = '/')}
                  >
                    Share New File
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
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
            {selectionMode && files.length > 0 && (
              <button
                onClick={toggleSelectAll}
                className="px-4 py-2 rounded-lg text-sm font-bold bg-surface-dark text-gray-400 hover:text-white border border-border-dark transition-all"
              >
                {selectedFiles.size === files.length ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <p className="text-gray-400">Loading files...</p>
          </div>
        ) : filteredFiles.length === 0 ? (
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
                        {new Date(file.uploaded_at).toLocaleDateString()} • {file.downloads}{' '}
                        download{file.downloads !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {selectionMode ? (
                      <button
                        onClick={() => toggleFileSelection(file.id)}
                        className="size-10 flex items-center justify-center rounded-lg border-2 transition-all"
                        style={{
                          borderColor: selectedFiles.has(file.id) ? '#3b82f6' : '#374151',
                          backgroundColor: selectedFiles.has(file.id) ? '#3b82f6' : 'transparent',
                        }}
                      >
                        {selectedFiles.has(file.id) && (
                          <Icon name="check" size="md" className="text-white" />
                        )}
                      </button>
                    ) : (
                      <>
                        {file.share_link && file.status === 'active' && (
                          <Button
                            variant="outline"
                            size="md"
                            icon="content_copy"
                            onClick={() => handleCopyLink(file.share_link!)}
                          >
                            Copy Link
                          </Button>
                        )}
                        <div className="relative" ref={openDropdown === file.id ? dropdownRef : null}>
                          <button
                            onClick={() => toggleDropdown(file.id)}
                            className="size-10 flex items-center justify-center rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                          >
                            <Icon name="more_vert" size="md" />
                          </button>

                          {openDropdown === file.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-surface-dark border border-border-dark-alt rounded-lg shadow-xl z-50 overflow-hidden">
                              <button
                                onClick={() => handleShareAgain(file)}
                                className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-3"
                              >
                                <Icon name="share" size="sm" />
                                Share Again
                              </button>
                              <div className="h-px bg-border-dark-alt" />
                              <button
                                onClick={() => handleDeleteFile(file.id)}
                                className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors flex items-center gap-3"
                              >
                                <Icon name="delete" size="sm" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
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
