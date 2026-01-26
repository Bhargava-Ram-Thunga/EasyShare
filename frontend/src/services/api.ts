import type { FileItem } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface ShareCreateRequest {
  files: Array<{
    name: string;
    size: number;
    type: string;
  }>;
}

export interface ShareCreateResponse {
  share_id: string;
  share_code: string;
  share_link: string;
  session_id: string;
  expires_at: string;
  peer_id: string;
  signaling_server: string;
}

export interface ShareDetailResponse {
  id: string;
  share_code: string;
  session_id: string;
  files: Array<{
    id: string;
    name: string;
    size: number;
    type: string;
  }>;
  total_size: number;
  created_at: string;
  expires_at: string | null;
  status: string;
  access_count: number;
  connection?: {
    peer_id: string;
    status: string;
    connected_at?: string;
  };
}

export interface FileRecord {
  id: string;
  name: string;
  size: number;
  type: string;
  uploaded_at: string;
  share_link: string | null;
  downloads: number;
  status: "active" | "expired" | "deleted";
}

export interface TransferHistoryRecord {
  id: string;
  type: "sent" | "received";
  file_name: string;
  file_size: number;
  timestamp: string;
  peer: string;
  status: string;
  speed: string | null;
}

export interface TransferStats {
  total_sent: {
    count: number;
    bytes: number;
  };
  total_received: {
    count: number;
    bytes: number;
  };
  total_transfers: number;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        detail: "An error occurred",
      }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    // Handle 204 No Content responses
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  // Share endpoints
  async createShare(files: FileItem[]): Promise<ShareCreateResponse> {
    return this.request<ShareCreateResponse>("/api/shares/create", {
      method: "POST",
      body: JSON.stringify({
        files: files.map((f) => ({
          name: f.name,
          size: f.size,
          type: f.type,
        })),
      }),
    });
  }

  async getShareDetails(shareCode: string): Promise<ShareDetailResponse> {
    return this.request<ShareDetailResponse>(`/api/shares/${shareCode}`);
  }

  async deleteShare(shareCode: string): Promise<void> {
    return this.request<void>(`/api/shares/${shareCode}`, {
      method: "DELETE",
    });
  }

  async addFilesToShare(shareCode: string, files: FileItem[]): Promise<ShareDetailResponse> {
    return this.request<ShareDetailResponse>(`/api/shares/${shareCode}/add-files`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ files }),
    });
  }

  // Files endpoints
  async getFiles(
    limit = 50,
    offset = 0,
    statusFilter?: string
  ): Promise<FileRecord[]> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    if (statusFilter) {
      params.append("status_filter", statusFilter);
    }
    return this.request<FileRecord[]>(`/api/files?${params}`);
  }

  async deleteFile(fileId: string, hardDelete: boolean = false): Promise<void> {
    const url = hardDelete
      ? `/api/files/${fileId}?hard_delete=true`
      : `/api/files/${fileId}`;
    return this.request<void>(url, {
      method: "DELETE",
    });
  }

  // History endpoints
  async getHistory(
    limit = 50,
    offset = 0
  ): Promise<TransferHistoryRecord[]> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    return this.request<TransferHistoryRecord[]>(`/api/history?${params}`);
  }

  async getHistoryStats(): Promise<TransferStats> {
    return this.request<TransferStats>("/api/history/stats");
  }

  async createTransferHistory(data: {
    share_id: string;
    transfer_type: "sent" | "received";
    file_name: string;
    file_size: number;
    peer_info?: string;
    status?: string;
    transfer_speed?: string;
    duration_seconds?: number;
  }): Promise<TransferHistoryRecord> {
    return this.request<TransferHistoryRecord>("/api/history", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string; version: string }> {
    return this.request<{ status: string; version: string }>("/health");
  }
}

export const apiService = new ApiService(API_BASE_URL);
