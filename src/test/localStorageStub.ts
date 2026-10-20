// Minimal localStorage stand-in so the storage loaders can be tested in a node
// environment without pulling in jsdom. Install with `useLocalStorageStub()`.

export type Store = { [key: string]: string };

export function useLocalStorageStub(): {
  set: (key: string, value: string) => void;
  raw: (key: string, value: unknown) => void;
  clear: () => void;
} {
  const store: Store = {};
  const stub = {
    getItem: (k: string) => (k in store ? store[k] : null),
    setItem: (k: string, v: string) => { store[k] = String(v); },
    removeItem: (k: string) => { delete store[k]; },
    clear: () => { for (const k of Object.keys(store)) delete store[k]; },
  };
  (globalThis as { localStorage?: unknown }).localStorage = stub;
  return {
    set: (key, value) => { store[key] = value; },
    /** Write an arbitrary value as JSON, to simulate a profile from an older build. */
    raw: (key, value) => { store[key] = JSON.stringify(value); },
    clear: () => stub.clear(),
  };
}
