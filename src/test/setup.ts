import '@testing-library/jest-dom';

// Node >=22 defines a global `localStorage` that is undefined unless
// `--localstorage-file` is passed, and vitest delays `window.localStorage`
// to it, so localStorage is missing unless we install a real in-memory
// Storage. This restores the browser contract the app (and every
// storage-backed test) relies on; it is an environment shim, not a change
// to what the app or tests assert.
function installStorage(): void {
  if (typeof globalThis.localStorage !== 'undefined') return;
  let data = new Map<string, string>();
  const storage: Storage = {
    get length() {
      return data.size;
    },
    clear() {
      data = new Map<string, string>();
    },
    getItem(key: string): string | null {
      return data.has(key) ? (data.get(key) as string) : null;
    },
    key(index: number): string | null {
      const keys = Array.from(data.keys());
      return index >= 0 && index < keys.length ? keys[index] : null;
    },
    removeItem(key: string) {
      data.delete(key);
    },
    setItem(key: string, value: string) {
      data.set(key, String(value));
    },
  };
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    enumerable: true,
    value: storage,
  });
}
installStorage();

if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
}