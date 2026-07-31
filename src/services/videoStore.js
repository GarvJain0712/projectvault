/**
 * Video storage.
 *
 * API mode   → the file is POSTed to the server, which stores it on disk or in
 *              Cloudinary and returns a permanent URL. Only that URL is saved
 *              on the project record.
 * local mode → the file goes into IndexedDB in this browser and the project
 *              record keeps a short `videoKey` pointing at it. localStorage
 *              cannot hold a video; its limit is about 5 MB of text.
 */

import { createId } from '@/utils/helpers';
import { uploadFile, USE_API } from './apiClient';

const DB_NAME = 'projectvault';
const DB_VERSION = 1;
const STORE_NAME = 'videos';

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB is not available in this browser.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function withStore(mode, operation) {
  return openDatabase().then(
    (db) =>
      new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, mode);
        const store = transaction.objectStore(STORE_NAME);
        const request = operation(store);

        transaction.oncomplete = () => db.close();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      })
  );
}

/* --------------------------------------------------------- IndexedDB (local) */

/** Save a File/Blob and return the key used to retrieve it later. */
export async function saveVideo(key, blob) {
  await withStore('readwrite', (store) => store.put(blob, key));
  return key;
}

/** Retrieve a Blob by key, or null when it is missing. */
export async function getVideo(key) {
  if (!key) return null;
  try {
    return (await withStore('readonly', (store) => store.get(key))) || null;
  } catch (error) {
    console.warn('[videoStore] read failed', error);
    return null;
  }
}

/** Remove a stored video (called when a project is deleted). */
export async function deleteVideo(key) {
  if (!key) return;
  try {
    await withStore('readwrite', (store) => store.delete(key));
  } catch (error) {
    console.warn('[videoStore] delete failed', error);
  }
}

/** Wipe every stored video — used by Settings → Reset all data. */
export async function clearVideos() {
  try {
    await withStore('readwrite', (store) => store.clear());
  } catch (error) {
    console.warn('[videoStore] clear failed', error);
  }
}

/* ------------------------------------------------------------- unified entry */

/**
 * Store a video the right way for the current mode.
 *
 * @param {File} file
 * @param {string} existingKey     reuse this IndexedDB key when re-uploading
 * @param {(percent:number)=>void} onProgress
 * @returns {Promise<{videoKey: string, videoUrl: string, duration?: number}>}
 */
export async function storeVideo(file, existingKey = '', onProgress) {
  if (USE_API) {
    const result = await uploadFile(file, onProgress);
    return {
      videoKey: '',
      videoUrl: result.url,
      // Cloudinary reports duration; disk mode returns 0 and we keep the
      // value the browser measured before uploading.
      duration: result.duration || undefined,
    };
  }

  // Local mode: no network, so animate the bar to give honest feedback that
  // work is happening, then write the blob.
  await new Promise((resolve) => {
    let percent = 0;
    const timer = window.setInterval(() => {
      percent = Math.min(100, percent + 9);
      onProgress?.(percent);
      if (percent >= 100) {
        window.clearInterval(timer);
        resolve();
      }
    }, 50);
  });

  const key = existingKey || createId('vid');
  await saveVideo(key, file);
  return { videoKey: key, videoUrl: '' };
}

/**
 * Upload a thumbnail or gallery image.
 * In API mode it becomes a URL; in local mode the caller keeps using base64.
 */
export async function storeImage(file) {
  if (!USE_API) return null;
  const result = await uploadFile(file);
  return result.url;
}
