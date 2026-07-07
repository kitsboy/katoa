/** Supported creator video uploads — MP4, MOV (QuickTime), WebM, M4V */

export const VIDEO_MIME_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/x-m4v',
  'video/webm',
  'video/x-msvideo',
] as const;

export const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.m4v', '.webm', '.avi'] as const;

export const VIDEO_ACCEPT_ATTR = [
  'video/mp4',
  'video/quicktime',
  'video/x-m4v',
  'video/webm',
  'video/*',
  ...VIDEO_EXTENSIONS,
].join(',');

export const DEFAULT_VIDEO_MAX_MB = 200;
export const DEFAULT_IMAGE_MAX_MB = 25;

export function isVideoMime(mime: string): boolean {
  if (!mime) return false;
  const lower = mime.toLowerCase();
  return lower.startsWith('video/') || VIDEO_MIME_TYPES.includes(lower as (typeof VIDEO_MIME_TYPES)[number]);
}

export function isVideoFile(file: File): boolean {
  if (isVideoMime(file.type)) return true;
  const ext = file.name.split('.').pop()?.toLowerCase();
  return Boolean(ext && VIDEO_EXTENSIONS.some((e) => e.slice(1) === ext));
}

export function normalizeVideoMime(file: File): string {
  if (file.type && file.type !== 'application/octet-stream') return file.type;
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'mov') return 'video/quicktime';
  if (ext === 'mp4' || ext === 'm4v') return 'video/mp4';
  if (ext === 'webm') return 'video/webm';
  if (ext === 'avi') return 'video/x-msvideo';
  return 'video/mp4';
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}