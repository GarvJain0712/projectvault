/**
 * Tiny fetch wrapper for the ProjectVault API.
 *
 * The whole app runs in one of two modes:
 *
 *   VITE_API_URL is set    → API mode.   Data lives in MongoDB, shared by every device.
 *   VITE_API_URL is empty  → local mode. Data lives in this browser (the original behaviour).
 *
 * That means the app keeps working with the server switched off, which makes
 * development a lot less annoying.
 */

const RAW_URL = import.meta.env.VITE_API_URL || '';

/** Base URL with any trailing slash removed, e.g. "http://localhost:4000". */
export const API_URL = RAW_URL.replace(/\/$/, '');

/** True when the app should talk to the server instead of localStorage. */
export const USE_API = Boolean(API_URL);

/**
 * The admin password lives ONLY in this device's localStorage, put there when
 * you unlock the app. It is deliberately not compiled into the bundle, so a
 * visitor who inspects the deployed site finds nothing useful.
 *
 * Unlock once per device (your laptop, your phone) and it is remembered.
 */
const ADMIN_KEY_STORAGE = 'pv:adminKey';

export function getAdminKey() {
  try {
    return window.localStorage.getItem(ADMIN_KEY_STORAGE) || '';
  } catch {
    return '';
  }
}

export function storeAdminKey(key) {
  try {
    window.localStorage.setItem(ADMIN_KEY_STORAGE, key);
  } catch {
    /* private browsing — the key just won't persist */
  }
}

export function clearAdminKey() {
  try {
    window.localStorage.removeItem(ADMIN_KEY_STORAGE);
  } catch {
    /* ignore */
  }
}

/** Headers attached to every request. Reads ignore them; writes need them. */
function authHeaders() {
  const key = getAdminKey();
  return key ? { 'x-admin-key': key } : {};
}

/**
 * Ask the server whether a password is correct.
 * Returns { ok, writeProtected } — `writeProtected: false` means the server
 * has no ADMIN_KEY set, so writes are open to everyone.
 */
export async function verifyAdminKey(candidate) {
  const response = await fetch(`${API_URL}/api/auth/verify`, {
    method: 'POST',
    headers: { 'x-admin-key': candidate },
  });

  if (response.ok) return response.json();
  if (response.status === 401) return { ok: false };
  throw new ApiError(`Could not reach the server (${response.status})`, response.status);
}

/** Thrown for any non-2xx response, carrying the server's message. */
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * @param {string} path   e.g. "/projects" — "/api" is added for you
 * @param {object} options  standard fetch options; `body` may be a plain object
 */
export async function http(path, options = {}) {
  const { body, headers, ...rest } = options;

  const response = await fetch(`${API_URL}/api${path}`, {
    ...rest,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...authHeaders(),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  // 204 No Content has no body. A proxy or host error page may return HTML,
  // so never assume the body is JSON — that turns a useful status code into a
  // confusing "Unexpected token '<'" parse error.
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new ApiError(data?.error || `Request failed (${response.status})`, response.status);
  }

  return data;
}

/**
 * Upload a file with real progress reporting.
 * fetch() cannot report upload progress, so this uses XMLHttpRequest.
 *
 * @param {File} file
 * @param {(percent: number) => void} onProgress
 * @returns {Promise<{url: string, name: string, size: number, duration: number}>}
 */
export function uploadFile(file, onProgress) {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append('file', file);

    const request = new XMLHttpRequest();
    request.open('POST', `${API_URL}/api/upload`);
    Object.entries(authHeaders()).forEach(([name, value]) =>
      request.setRequestHeader(name, value)
    );

    request.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    });

    request.addEventListener('load', () => {
      let payload = null;
      try {
        payload = JSON.parse(request.responseText);
      } catch {
        payload = null;
      }

      if (request.status >= 200 && request.status < 300) {
        onProgress?.(100);
        resolve(payload);
      } else {
        reject(new ApiError(payload?.error || `Upload failed (${request.status})`, request.status));
      }
    });

    request.addEventListener('error', () => reject(new ApiError('Network error during upload', 0)));
    request.addEventListener('abort', () => reject(new ApiError('Upload cancelled', 0)));

    request.send(form);
  });
}

/** Quick reachability check — used by Settings to show connection status. */
export async function checkHealth() {
  if (!USE_API) return { ok: false, mode: 'local' };
  try {
    const data = await http('/health');
    return { ...data, mode: 'api' };
  } catch (error) {
    return { ok: false, mode: 'api', error: error.message };
  }
}
