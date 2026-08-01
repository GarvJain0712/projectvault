import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMenu, FiPlus, FiSearch } from 'react-icons/fi';
import ThemeToggle from './ThemeToggle';
import LockButton from './LockButton';
import Button from './ui/Button';
import { useAuth } from '@/context/AuthContext';

/** Human-readable page title for the current route. */
const ROUTE_TITLES = {
  '/': 'Dashboard',
  '/projects': 'All Projects',
  '/upload': 'Upload Video',
  '/favorites': 'Favorites',
  '/watch-later': 'Watch Later',
  '/about': 'About Me',
  '/settings': 'Settings',
};

export default function Navbar({ onOpenMenu, onOpenPalette }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { canWrite } = useAuth();

  const title =
    ROUTE_TITLES[pathname] ||
    (pathname.startsWith('/project/') ? 'Project Details' : 'ProjectVault');

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="glass sticky top-0 z-20 border-b border-line"
    >
      <div className="flex h-16 items-center gap-2 px-3 sm:gap-3 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Open navigation menu"
          className="-ml-1 shrink-0 rounded-lg p-2 text-muted transition hover:bg-ink/5 hover:text-ink lg:hidden"
        >
          <FiMenu className="text-xl" />
        </button>

        <h1 className="min-w-0 truncate text-[15px] font-semibold text-ink">{title}</h1>

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          {/* Command-palette trigger, doubles as a global search affordance */}
          <button
            type="button"
            onClick={onOpenPalette}
            className="hidden items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm text-muted transition hover:border-muted/40 hover:text-ink sm:flex"
          >
            <FiSearch />
            <span>Search projects…</span>
            <kbd className="ml-6 rounded border border-line bg-bg px-1.5 py-0.5 text-[10px] font-medium">
              Ctrl K
            </kbd>
          </button>

          <button
            type="button"
            onClick={onOpenPalette}
            aria-label="Search projects"
            className="rounded-lg p-2 text-muted transition hover:bg-ink/5 hover:text-ink sm:hidden"
          >
            <FiSearch className="text-lg" />
          </button>

          <ThemeToggle />
          <LockButton />

          {/* Adding is pointless while locked — the server would refuse it. */}
          {canWrite ? (
            <Button
              size="sm"
              icon={FiPlus}
              onClick={() => navigate('/upload')}
              aria-label="New project"
              className="ml-0.5 sm:ml-1"
            >
              {/* Icon only on phones — the label crowded everything else out */}
              <span className="hidden sm:inline">New Project</span>
            </Button>
          ) : null}
        </div>
      </div>
    </motion.header>
  );
}
