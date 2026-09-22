import { getStorage, removeStorage, setStorage } from './storage';

export interface StudioDraft<T> {
  savedAt: string;
  value: T;
}

function key(projectId: string): string {
  return `katoa_studio_draft_${projectId}`;
}

function historyKey(projectId: string): string {
  return `katoa_studio_history_${projectId}`;
}

export function saveStudioDraft<T>(projectId: string, value: T): StudioDraft<T> {
  const draft: StudioDraft<T> = { savedAt: new Date().toISOString(), value };
  setStorage(key(projectId), draft);
  return draft;
}

export function loadStudioDraft<T>(projectId: string): StudioDraft<T> | null {
  return getStorage<StudioDraft<T> | null>(key(projectId), null);
}

export function clearStudioDraft(projectId: string): void {
  removeStorage(key(projectId));
}

export function saveStudioVersion<T>(projectId: string, value: T): StudioDraft<T> {
  const version: StudioDraft<T> = { savedAt: new Date().toISOString(), value };
  const versions = getStorage<StudioDraft<T>[]>(historyKey(projectId), []);
  const next = [version, ...versions].slice(0, 8);
  setStorage(historyKey(projectId), next);
  return version;
}

export function loadStudioVersions<T>(projectId: string): StudioDraft<T>[] {
  return getStorage<StudioDraft<T>[]>(historyKey(projectId), []);
}
