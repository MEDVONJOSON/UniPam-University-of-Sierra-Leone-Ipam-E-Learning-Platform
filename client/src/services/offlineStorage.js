// ─── Offline Storage Service (IndexedDB) ─────────────────────────────────────
// Enables students in Sierra Leone with unstable/costly internet to save materials
// and access them anytime with zero data usage.

const DB_NAME = "unipam_offline_vault";
const DB_VERSION = 1;
const STORE_NAME = "materials";

function openDB() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("IndexedDB is not supported on this browser."));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveMaterialOffline(material) {
  const db = await openDB();
  return new Promise(async (resolve, reject) => {
    try {
      let cachedBlob = null;
      let dataUrl = null;

      // If there is a file URL, attempt to cache the blob if reachable
      if (material.file_url && material.material_type !== "link") {
        try {
          const res = await fetch(material.file_url);
          if (res.ok) {
            cachedBlob = await res.blob();
            dataUrl = URL.createObjectURL(cachedBlob);
          }
        } catch (_) {
          // Network fetch for blob may fail if already offline; store metadata
        }
      }

      const record = {
        ...material,
        is_offline_cached: true,
        cached_at: new Date().toISOString(),
        cachedBlob,
        localUrl: dataUrl || material.file_url
      };

      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(record);
      req.onsuccess = () => resolve(record);
      req.onerror = () => reject(req.error);
    } catch (err) {
      reject(err);
    }
  });
}

export async function getOfflineMaterials() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

export async function removeOfflineMaterial(materialId) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(materialId);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return false;
  }
}

export async function isMaterialSavedOffline(materialId) {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(materialId);
      req.onsuccess = () => resolve(!!req.result);
      req.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

export async function getOfflineVaultSummary() {
  const list = await getOfflineMaterials();
  const totalCount = list.length;
  let totalBytes = 0;
  list.forEach(item => {
    if (item.file_size_bytes) totalBytes += Number(item.file_size_bytes);
    else if (item.cachedBlob?.size) totalBytes += item.cachedBlob.size;
  });
  return { totalCount, totalBytes, list };
}
