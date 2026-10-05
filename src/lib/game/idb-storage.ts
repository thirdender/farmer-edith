import type { StateStorage } from "zustand/middleware";

const DB_NAME = "farmer-edith";
const STORE = "kv";

let opening: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB is unavailable"));
  }
  if (!opening) {
    opening = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(STORE)) {
          request.result.createObjectStore(STORE);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        opening = null;
        reject(request.error ?? new Error("IndexedDB open failed"));
      };
    });
  }
  return opening;
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed"));
  });
}

async function readKey(name: string): Promise<string | null> {
  const database = await openDb();
  const result = await requestToPromise(database.transaction(STORE, "readonly").objectStore(STORE).get(name));
  return typeof result === "string" ? result : null;
}

async function writeKey(name: string, value: string): Promise<void> {
  const database = await openDb();
  await requestToPromise(database.transaction(STORE, "readwrite").objectStore(STORE).put(value, name));
}

/** Zustand persist storage. Migrates a one-time localStorage save into IndexedDB. */
export const idbStorage: StateStorage = {
  async getItem(name) {
    if (typeof indexedDB === "undefined") return null;
    const saved = await readKey(name);
    if (saved) return saved;
    try {
      const legacy = localStorage.getItem(name);
      if (!legacy) return null;
      await writeKey(name, legacy);
      localStorage.removeItem(name);
      return legacy;
    } catch {
      return null;
    }
  },
  async setItem(name, value) {
    if (typeof indexedDB === "undefined") return;
    await writeKey(name, value);
  },
  async removeItem(name) {
    if (typeof indexedDB === "undefined") return;
    const database = await openDb();
    await requestToPromise(database.transaction(STORE, "readwrite").objectStore(STORE).delete(name));
  },
};
