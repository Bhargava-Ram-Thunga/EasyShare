import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "movie";
  if (mimeType.startsWith("audio/")) return "audio_file";
  if (mimeType === "application/pdf") return "picture_as_pdf";
  if (mimeType.includes("zip") || mimeType.includes("compressed"))
    return "folder_zip";
  if (mimeType.includes("word") || mimeType.includes("document"))
    return "description";
  if (mimeType.includes("sheet") || mimeType.includes("excel"))
    return "table_chart";
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint"))
    return "slideshow";
  return "draft";
}

export function getFileTypeLabel(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "Image";
  if (mimeType.startsWith("video/")) return "Video";
  if (mimeType.startsWith("audio/")) return "Audio";
  if (mimeType === "application/pdf") return "PDF Document";
  if (mimeType.includes("zip") || mimeType.includes("compressed"))
    return "ZIP Archive";
  if (mimeType.includes("word") || mimeType.includes("document"))
    return "Document";
  if (mimeType.includes("sheet") || mimeType.includes("excel"))
    return "Spreadsheet";
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint"))
    return "Presentation";
  return "File";
}

export function generateShareCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 9; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

export function formatShareCode(code: string): string {
  // Format as XXX-XXX-XXX for better readability
  return code.match(/.{1,3}/g)?.join('-') || code;
}
