/**
 * Thin, safe wrapper around localStorage.
 * Every read/write is guarded so a corrupted value or a private-browsing
 * session can never crash the app.
 */

export function readValue(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch (error) {
    console.warn(`[storage] Could not read "${key}"`, error);
    return fallback;
  }
}

export function writeValue(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    // Most common cause: the 5 MB quota is full.
    console.warn(`[storage] Could not write "${key}"`, error);
    return false;
  }
}

export function removeValue(key) {
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.warn(`[storage] Could not remove "${key}"`, error);
  }
}
