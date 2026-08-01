import { useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import CommandPalette from '@/components/CommandPalette';
import ConnectionBanner from '@/components/ConnectionBanner';
import ErrorBoundary from '@/components/ErrorBoundary';
import ScrollToTop from '@/components/ui/ScrollToTop';
import useHotkey from '@/hooks/useHotkey';

/**
 * App shell: sidebar + navbar + routed page + footer.
 * Owns the mobile drawer and the Ctrl/Cmd+K command palette.
 *
 * Note on animation: the page enter-transition lives in <PageTransition>
 * inside each page, driven by the `key` below. We deliberately do NOT wrap
 * the Outlet in <AnimatePresence mode="wait"> — under React 18 StrictMode the
 * double-invoked mount can leave AnimatePresence waiting on an exit that never
 * resolves, which renders the page area permanently blank.
 */
export default function MainLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const { pathname } = useLocation();

  const openPalette = useCallback(() => setPaletteOpen(true), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);

  useHotkey('mod+k', openPalette);

  // Belt and braces: whatever caused the navigation, the drawer must not
  // survive a route change. Without this a stray overlay can block the page.
  useEffect(() => {
    setMenuOpen(false);
    setPaletteOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-bg">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="lg:pl-64">
        <Navbar onOpenMenu={() => setMenuOpen(true)} onOpenPalette={openPalette} />

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <ConnectionBanner />

            {/* `key` remounts the page on navigation so PageTransition replays */}
            <ErrorBoundary resetKey={pathname}>
              <div key={pathname}>
                <Outlet />
              </div>
            </ErrorBoundary>
          </div>
        </main>

        <Footer />
      </div>

      <ScrollToTop />
      <CommandPalette open={paletteOpen} onClose={closePalette} />
    </div>
  );
}
