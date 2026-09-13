const DB_NAME = "tokyo-family-guide-private-qr-v1";
const STORE_NAME = "images";
const META_NAME = "meta";
const VERIFIER = "visit-japan-private-qr-v1";
const ITERATIONS = 310_000;

export const QR_SLOTS = [1, 2, 3] as const;
export type QrSlot = typeof QR_SLOTS[number];

type EncryptedValue = { iv: Uint8Array<ArrayBuffer>; data: ArrayBuffer };
type VaultMeta = { salt: Uint8Array<ArrayBuffer>; verifier: EncryptedValue };
type QrRecord = { image: EncryptedValue; name: EncryptedValue; mime: string };

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB || !window.crypto?.subtle) {
      reject(new Error("此瀏覽器無法使用加密的裝置內儲存空間"));
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      db.createObjectStore(STORE_NAME);
      db.createObjectStore(META_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("無法開啟裝置內儲存空間"));
  });
}

async function withStore<T>(name: string, mode: IDBTransactionMode, action: (store: IDBObjectStore, finish: (value: T) => void) => void): Promise<T> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(name, mode);
    let result: T;
    tx.oncomplete = () => { db.close(); resolve(result); };
    tx.onerror = () => { db.close(); reject(tx.error || new Error("無法存取 QR 資料")); };
    tx.onabort = () => { db.close(); reject(tx.error || new Error("操作已中止")); };
    action(tx.objectStore(name), value => { result = value; });
  });
}

function deriveKey(password: string, salt: Uint8Array<ArrayBuffer>): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"])
    .then(baseKey => crypto.subtle.deriveKey(
      { name: "PBKDF2", salt, iterations: ITERATIONS, hash: "SHA-256" },
      baseKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    ));
}

async function encrypt(key: CryptoKey, data: BufferSource): Promise<EncryptedValue> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  return { iv, data: await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data) };
}

function decrypt(key: CryptoKey, value: EncryptedValue): Promise<ArrayBuffer> {
  return crypto.subtle.decrypt({ name: "AES-GCM", iv: value.iv }, key, value.data);
}

export function getVaultMeta(): Promise<VaultMeta | undefined> {
  return withStore(META_NAME, "readonly", (store, finish) => {
    const request = store.get("vault");
    request.onsuccess = () => finish(request.result as VaultMeta | undefined);
  });
}

export async function createVault(password: string): Promise<CryptoKey> {
  if (await getVaultMeta()) throw new Error("此裝置已有 QR 保管箱");
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveKey(password, salt);
  const verifier = await encrypt(key, new TextEncoder().encode(VERIFIER));
  await withStore<void>(META_NAME, "readwrite", (store, finish) => {
    store.add({ salt, verifier } satisfies VaultMeta, "vault");
    finish(undefined);
  });
  return key;
}

export async function unlockVault(password: string, meta: VaultMeta): Promise<CryptoKey> {
  const key = await deriveKey(password, meta.salt);
  try {
    const value = new TextDecoder().decode(await decrypt(key, meta.verifier));
    if (value !== VERIFIER) throw new Error("密碼錯誤");
  } catch {
    throw new Error("密碼錯誤，請重試");
  }
  return key;
}

export function getQrRecord(slot: QrSlot): Promise<QrRecord | undefined> {
  return withStore(STORE_NAME, "readonly", (store, finish) => {
    const request = store.get(slot);
    request.onsuccess = () => finish(request.result as QrRecord | undefined);
  });
}

export async function loadQrImage(slot: QrSlot, key: CryptoKey): Promise<{ image: Blob; name: string } | undefined> {
  const record = await getQrRecord(slot);
  if (!record) return undefined;
  const [bytes, name] = await Promise.all([decrypt(key, record.image), decrypt(key, record.name)]);
  return { image: new Blob([bytes], { type: record.mime }), name: new TextDecoder().decode(name) };
}

export async function saveQrImage(slot: QrSlot, key: CryptoKey, file: File, name: string): Promise<void> {
  const [image, encryptedName] = await Promise.all([
    encrypt(key, await file.arrayBuffer()),
    encrypt(key, new TextEncoder().encode(name)),
  ]);
  await withStore<void>(STORE_NAME, "readwrite", (store, finish) => {
    store.put({ image, name: encryptedName, mime: file.type } satisfies QrRecord, slot);
    finish(undefined);
  });
}

export function deleteQrImage(slot: QrSlot): Promise<void> {
  return withStore<void>(STORE_NAME, "readwrite", (store, finish) => {
    store.delete(slot);
    finish(undefined);
  });
}

export async function resetVault(): Promise<void> {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction([STORE_NAME, META_NAME], "readwrite");
    tx.objectStore(STORE_NAME).clear();
    tx.objectStore(META_NAME).clear();
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error || new Error("無法清除本機 QR")); };
  });
}
