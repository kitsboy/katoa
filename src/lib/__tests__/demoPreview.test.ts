import { beforeEach, describe, expect, it } from 'vitest';
import {
  getDemoDetailLevel,
  getDemoScenario,
  resetDemoPreview,
  setDemoDetailLevel,
  setDemoScenario,
} from '../demoPreview';
import { STORAGE_KEYS, setStorage } from '../storage';

describe('demoPreview', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('persists the selected story and detail level locally', () => {
    setDemoScenario('music');
    setDemoDetailLevel('quick');

    expect(getDemoScenario()).toBe('music');
    expect(getDemoDetailLevel()).toBe('quick');
  });

  it('resets preview state and local demo data without affecting unrelated keys', () => {
    setDemoScenario('creator');
    setDemoDetailLevel('quick');
    setStorage(STORAGE_KEYS.exploreFavorites, ['mock-001']);
    setStorage(STORAGE_KEYS.themeAccent, '#14e6ff');

    resetDemoPreview();

    expect(getDemoScenario()).toBe('community');
    expect(getDemoDetailLevel()).toBe('rich');
    expect(localStorage.getItem(STORAGE_KEYS.exploreFavorites)).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.themeAccent)).toBe(JSON.stringify('#14e6ff'));
  });
});
