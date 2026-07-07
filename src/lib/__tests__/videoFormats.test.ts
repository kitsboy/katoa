import { describe, it, expect } from 'vitest';
import {
  isVideoFile,
  isVideoMime,
  normalizeVideoMime,
  formatFileSize,
} from '../videoFormats';

describe('videoFormats', () => {
  it('detects MOV by extension', () => {
    const file = new File(['x'], 'clip.MOV', { type: 'application/octet-stream' });
    expect(isVideoFile(file)).toBe(true);
    expect(normalizeVideoMime(file)).toBe('video/quicktime');
  });

  it('detects MP4 mime', () => {
    expect(isVideoMime('video/mp4')).toBe(true);
    expect(isVideoMime('image/png')).toBe(false);
  });

  it('formats file sizes', () => {
    expect(formatFileSize(500)).toBe('500 B');
    expect(formatFileSize(2048)).toBe('2.0 KB');
    expect(formatFileSize(5 * 1024 * 1024)).toBe('5.0 MB');
  });
});