import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getStorage, setStorage } from '../storage';

describe('getStorage / setStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('returns fallback when key is missing', () => {
    expect(getStorage('missing-key', { count: 0 })).toEqual({ count: 0 });
  });

  it('stores and retrieves JSON values', () => {
    setStorage('prefs', { theme: 'dark', count: 3 });
    expect(getStorage('prefs', { theme: 'light', count: 0 })).toEqual({
      theme: 'dark',
      count: 3,
    });
  });

  it('returns fallback for invalid JSON', () => {
    localStorage.setItem('broken', '{not-json');
    expect(getStorage('broken', ['fallback'])).toEqual(['fallback']);
  });
});