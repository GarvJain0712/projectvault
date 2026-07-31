import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  USE_API,
  clearAdminKey,
  getAdminKey,
  storeAdminKey,
  verifyAdminKey,
} from '@/services/apiClient';

const AuthContext = createContext(null);

/**
 * Controls whether this device may change anything.
 *
 * Reading is always allowed. Writing requires unlocking with the admin
 * password once per device; the password is then kept in localStorage so you
 * don't retype it every visit.
 *
 * In local mode (no VITE_API_URL) there is no server to ask, so everything is
 * unlocked — the data never leaves your browser anyway.
 */
export function AuthProvider({ children }) {
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(USE_API);
  const [serverProtected, setServerProtected] = useState(true);

  // On load, re-check any password this device already stored. It may have
  // been changed on the server since, so we verify rather than assume.
  useEffect(() => {
    if (!USE_API) {
      setUnlocked(true);
      setChecking(false);
      return;
    }

    let cancelled = false;

    async function check() {
      const stored = getAdminKey();
      if (!stored) {
        if (!cancelled) setChecking(false);
        return;
      }

      try {
        const result = await verifyAdminKey(stored);
        if (cancelled) return;
        if (result.ok) {
          setUnlocked(true);
          setServerProtected(result.writeProtected !== false);
        } else {
          clearAdminKey(); // stale or changed — forget it
        }
      } catch {
        // Server unreachable. Stay locked; the connection banner explains why.
      } finally {
        if (!cancelled) setChecking(false);
      }
    }

    check();
    return () => {
      cancelled = true;
    };
  }, []);

  const unlock = useCallback(async (password) => {
    const result = await verifyAdminKey(password.trim());
    if (!result.ok) return false;

    storeAdminKey(password.trim());
    setUnlocked(true);
    setServerProtected(result.writeProtected !== false);
    return true;
  }, []);

  const lock = useCallback(() => {
    clearAdminKey();
    setUnlocked(false);
  }, []);

  const value = useMemo(
    () => ({
      /** True when this device is allowed to add / edit / delete. */
      canWrite: !USE_API || unlocked,
      unlocked,
      checking,
      /** False when the server has no ADMIN_KEY — writes are open to anyone. */
      serverProtected,
      requiresUnlock: USE_API,
      unlock,
      lock,
    }),
    [unlocked, checking, serverProtected, unlock, lock]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>.');
  return context;
}
