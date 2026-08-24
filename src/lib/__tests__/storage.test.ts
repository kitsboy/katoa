import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  clearDemoAccountStorage,
  getStorage,
  loadThemeAccent,
  saveThemeAccent,
  setStorage,
  STORAGE_KEYS,
} from '../storage';

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

describe('theme accent + demo wipe', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('persists a hex accent and applies the CSS variable', () => {
    saveThemeAccent('#14e6ff');
    expect(loadThemeAccent()).toBe('#14e6ff');
    expect(document.documentElement.style.getPropertyValue('--theme-accent')).toBe('#14e6ff');
  });

  it('clears demo account keys only', () => {
    setStorage(STORAGE_KEYS.demoDashboardProjects, [{ id: '1' }]);
    setStorage(STORAGE_KEYS.walletAddresses, [{ id: 'w' }]);
    setStorage(STORAGE_KEYS.exploreFavorites, ['keep']);
    clearDemoAccountStorage();
    expect(getStorage(STORAGE_KEYS.demoDashboardProjects, null)).toBeNull();
    expect(getStorage(STORAGE_KEYS.walletAddresses, null)).toBeNull();
    expect(getStorage(STORAGE_KEYS.exploreFavorites, [])).toEqual(['keep']);
  });
});