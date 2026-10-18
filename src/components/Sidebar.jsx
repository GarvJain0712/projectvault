import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiBookmark,
  FiFolder,
  FiGrid,
  FiHeart,
  FiSettings,
  FiUploadCloud,
  FiUser,
  FiX,
} from 'react-icons/fi';
import { useProjects } from '@/context/ProjectContext';
import { cx } from '@/utils/helpers';

/** Nav items live in one array so the desktop rail and mobile drawer agree. */
const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: FiGrid, end: true },
  { to: '/projects', label: 'All Projects', icon: FiFolder, countKey: 'totalProjects' },
  { to: '/upload', label: 'Upload Video', icon: FiUploadCloud },
  // { to: '/favorites', label: 'Favorites', icon: FiHeart, countKey: 'totalFavorites' },
  // { to: '/watch-later', label: 'Watch Later', icon: FiBookmark, countKey: 'totalWatchLater' },
  { to: '/about', label: 'About Me', icon: FiUser },
  { to: '/settings', label: 'Settings', icon: FiSettings },
];

function NavItems({ onNavigate }) {
  const { stats } = useProjects();

  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map(({ to, label, icon: Icon, end, countKey }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cx(
              'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-150',
              isActive
                ? 'text-accent-ink translate-x-[-1px] translate-y-[-1px]'
                : 'text-muted hover:bg-[#f9c00f]/15 hover:text-ink'
            )
          }
        >
          {({ isActive }) => (
            <>
              {/* Sliding highlight shared between items via layoutId */}
              {isActive ? (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 -z-10 rounded-xl bg-accent border-2 border-line shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              ) : null}
              <Icon className="shrink-0 text-[17px]" aria-hidden />
              <span className="flex-1">{label}</span>
              {countKey && stats[countKey] > 0 ? (
                <span className="rounded-md bg-ink/5 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-muted dark:bg-white/10">
                  {stats[countKey]}
                </span>
              ) : null}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

function VaultMark() {
  return (
    <div className="flex items-center gap-2.5 px-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-ink">
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
          <path d="M9 7.5v9l7.5-4.5L9 7.5z" />
        </svg>
      </div>
      <div className="leading-tight">
        <p className="text-sm font-semibold text-ink">ProjectVault</p>
        <p className="text-[11px] text-muted">Video library</p>
      </div>
    </div>
  );
}

/**
 * Persistent rail on desktop (lg+), slide-in drawer on mobile.
 */
export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Desktop rail */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-line bg-surface/60 px-3 py-5 backdrop-blur-xl lg:flex lg:flex-col">
        <VaultMark />
        <div className="mt-7 flex-1 overflow-y-auto no-scrollbar">
          <NavItems />
        </div>
        <p className="px-3 pt-4 text-[11px] leading-relaxed text-muted">
          Press{' '}
          <kbd className="rounded border border-line bg-bg px-1 py-0.5 font-sans text-[10px]">
            Ctrl
          </kbd>{' '}
          <kbd className="rounded border border-line bg-bg px-1 py-0.5 font-sans text-[10px]">K</kbd>{' '}
          to search
        </p>
      </aside>

      {/*
        Mobile drawer.

        Deliberately NOT wrapped in <AnimatePresence>. With an exit animation,
        the backdrop could survive the close and sit invisibly over the page,
        swallowing every tap — the whole screen went dead on phones. Rendering
        conditionally means React removes it immediately and unconditionally.
        We keep the slide-in; the close is instant.
      */}
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={onClose}
          />
          <motion.aside
            className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-line bg-surface px-3 py-5"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
          >
            <div className="flex items-center justify-between">
              <VaultMark />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="rounded-lg p-2 text-muted transition hover:bg-ink/5 hover:text-ink"
              >
                <FiX />
              </button>
            </div>
            <div className="mt-7 flex-1 overflow-y-auto">
              <NavItems onNavigate={onClose} />
            </div>
          </motion.aside>
        </div>
      ) : null}
    </>
  );
}
