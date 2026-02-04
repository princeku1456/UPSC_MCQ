import { openDB } from 'idb';

const DB_NAME = 'QuizAppDB';
const DB_VERSION = 1;
const STORE_NAME = 'app_cache';

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, { keyPath: 'key' });
    }
  },
});

export const localDB = {
  async get(key: string) {
    return (await dbPromise).get(STORE_NAME, key);
  },
  async set(key: string, val: any) {
    return (await dbPromise).put(STORE_NAME, { key, ...val });
  },
  async delete(key: string) {
    return (await dbPromise).delete(STORE_NAME, key);
  },
  async clear() {
    return (await dbPromise).clear(STORE_NAME);
  },
  async getAllKeys() {
    return (await dbPromise).getAllKeys(STORE_NAME);
  },
};
