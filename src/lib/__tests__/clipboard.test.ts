import { describe, expect, it, vi } from 'vitest';
import { copyToClipboard } from '../clipboard';

describe('copyToClipboard', () => {
  it('returns success when clipboard API works', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    await expect(copyToClipboard('hello')).resolves.toBe('success');
    expect(writeText).toHaveBeenCalledWith('hello');
  });
});