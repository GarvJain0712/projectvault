import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ACCENT_COLORS, STORAGE_KEYS } from '@/data/constants';
import { readValue, writeValue } from '@/services/storage';

const ThemeContext = createContext(null);

const DEFAULT_SETTINGS = {
  theme: 'light', // 'light' | 'dark' | 'system'
  accent: ACCENT_COLORS[0].value,
  viewMode: 'grid', // 'grid' | 'list'
  compact: false,
};

function resolveTheme(theme) {
  if (theme !== 'system') return theme;
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

/** Owns theme, accent colour and the grid/list preference. */
export function ThemeProvider({ children }) {
  const [settings, setSettings] = useState(() => ({
    ...DEFAULT_SETTINGS,
    ...readValue(STORAGE_KEYS.settings, {}),
  }));

  // Apply the theme + accent to <html> whenever they change.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', resolveTheme(settings.theme) === 'dark');
    root.style.setProperty('--color-accent', settings.accent);
    writeValue(STORAGE_KEYS.settings, settings);
  }, [settings]);

  // Follow the OS when the user picked "system".
  useEffect(() => {
    if (settings.theme !== 'system') return undefined;
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => document.documentElement.classList.toggle('dark', query.matches);
    query.addEventListener('change', handler);
    return () => query.removeEventListener('change', handler);
  }, [settings.theme]);

  const update = useCallback((patch) => {
    setSettings((current) => ({ ...current, ...patch }));
  }, []);

  const value = useMemo(
    () => ({
      ...settings,
      isDark: resolveTheme(settings.theme) === 'dark',
      setTheme: (theme) => update({ theme }),
      toggleTheme: () =>
        setSettings((current) => ({
          ...current,
          theme: resolveTheme(current.theme) === 'dark' ? 'light' : 'dark',
        })),
      setAccent: (accent) => update({ accent }),
      setViewMode: (viewMode) => update({ viewMode }),
      setCompact: (compact) => update({ compact }),
      resetSettings: () => setSettings(DEFAULT_SETTINGS),
    }),
    [settings, update]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside <ThemeProvider>.');
  return context;
}
