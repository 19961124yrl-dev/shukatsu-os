// IndexedDB storage migration.  Database versions are storage-layout versions,
// not application-data schema versions (see state.js).
export const DB_NAME = 'shukatsu-os-japan';
export const INDEXED_DB_VERSION = 3;
export const STATE_STORE = 'state';

export function upgradeDatabase(db, oldVersion, newVersion) {
  // v1: first durable state store.  Always test before creating: an upgrade can
  // run on an already-created store and createObjectStore would otherwise throw.
  if (oldVersion < 1 && !db.objectStoreNames.contains(STATE_STORE)) {
    db.createObjectStore(STATE_STORE);
  }
  // v2 reserved the stable `main` record. No store rewrite is required, so
  // existing data remains untouched.
  if (oldVersion < 2) { /* record-key migration is intentionally non-destructive */ }
  // v3 adds no store. State fields are migrated after read by STATE_SCHEMA_VERSION.
  if (oldVersion < 3) { /* application schema migration occurs in state.js */ }
  if (!db.objectStoreNames.contains(STATE_STORE)) db.createObjectStore(STATE_STORE);
}

export function openDatabase(indexedDb = indexedDB) {
  return new Promise((resolve, reject) => {
    const request = indexedDb.open(DB_NAME, INDEXED_DB_VERSION);
    request.onupgradeneeded = event => upgradeDatabase(request.result, event.oldVersion, event.newVersion);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('別のタブがデータベースを使用中です。'));
  });
}

export async function readState() {
  const db = await openDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const request = db.transaction(STATE_STORE, 'readonly').objectStore(STATE_STORE).get('main');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } finally { db.close(); }
}

export async function writeState(value) {
  const db = await openDatabase();
  try {
    await new Promise((resolve, reject) => {
      const request = db.transaction(STATE_STORE, 'readwrite').objectStore(STATE_STORE).put(value, 'main');
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } finally { db.close(); }
}
