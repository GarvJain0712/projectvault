import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FiBookmark,
  FiCornerDownLeft,
  FiFolder,
  FiGrid,
  FiHeart,
  FiMoon,
  FiSearch,
  FiSettings,
  FiUploadCloud,
  FiUser,
  FiVideo,
} from 'react-icons/fi';
import { useProjects } from '@/context/ProjectContext';
import { useTheme } from '@/context/ThemeContext';
import { cx } from '@/utils/helpers';

/**
 * Ctrl/Cmd + K command palette: jump to a page, open a project, toggle theme.
 * Arrow keys move the selection, Enter runs it, Escape closes.
 */
export default function CommandPalette({ open, onClose }) {
  const navigate = useNavigate();
  const { projects } = useProjects();
  const { toggleTheme } = useTheme();
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const listRef = useRef(null);

  const run = (action) => {
    onClose();
    setQuery('');
    action();
  };

  const commands = useMemo(() => {
    const pages = [
      { id: 'nav-home', label: 'Go to Dashboard', icon: FiGrid, run: () => navigate('/') },
      { id: 'nav-projects', label: 'Go to All Projects', icon: FiFolder, run: () => navigate('/projects') },
      { id: 'nav-upload', label: 'Upload a new project', icon: FiUploadCloud, run: () => navigate('/upload') },
      { id: 'nav-fav', label: 'Go to Favorites', icon: FiHeart, run: () => navigate('/favorites') },
      { id: 'nav-later', label: 'Go to Watch Later', icon: FiBookmark, run: () => navigate('/watch-later') },
      { id: 'nav-about', label: 'Go to About Me', icon: FiUser, run: () => navigate('/about') },
      { id: 'nav-settings', label: 'Go to Settings', icon: FiSettings, run: () => navigate('/settings') },
      { id: 'toggle-theme', label: 'Toggle light / dark theme', icon: FiMoon, run: toggleTheme },
    ];

    const projectCommands = projects.map((project) => ({
      id: project.id,
      label: project.title,
      hint: project.category,
      icon: FiVideo,
      run: () => navigate(`/project/${project.id}`),
    }));

    const term = query.trim().toLowerCase();
    const all = [...projectCommands, ...pages];
    if (!term) return all.slice(0, 8);

    return all
      .filter((command) => `${command.label} ${command.hint || ''}`.toLowerCase().includes(term))
      .slice(0, 10);
  }, [query, projects, navigate, toggleTheme]);

  // Reset the cursor whenever the result set changes.
  useEffect(() => setCursor(0), [query, open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setCursor((current) => (current + 1) % Math.max(commands.length, 1));
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setCursor((current) => (current - 1 + commands.length) % Math.max(commands.length, 1));
      }
      if (event.key === 'Enter' && commands[cursor]) {
        event.preventDefault();
        run(commands[cursor].run);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[150] flex items-start justify-center p-4 pt-[12vh]">
          <motion.div
            className="absolute inset-0 bg-black/45 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            initial={{ opacity: 0, y: -14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            className="glass relative w-full max-w-xl overflow-hidden rounded-2xl shadow-lift"
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <FiSearch className="shrink-0 text-muted" aria-hidden />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search projects or jump to a page…"
                aria-label="Command palette search"
                className="h-14 w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
              />
              <kbd className="shrink-0 rounded border border-line bg-bg px-1.5 py-0.5 text-[10px] text-muted">
                Esc
              </kbd>
            </div>

            <div ref={listRef} className="max-h-80 overflow-y-auto p-2">
              {commands.length === 0 ? (
                <p className="px-3 py-8 text-center text-sm text-muted">
                  No matches for “{query}”.
                </p>
              ) : (
                commands.map((command, index) => {
                  const Icon = command.icon;
                  return (
                    <button
                      key={command.id}
                      type="button"
                      onMouseEnter={() => setCursor(index)}
                      onClick={() => run(command.run)}
                      className={cx(
                        'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors',
                        index === cursor ? 'bg-accent/10 text-accent' : 'text-ink hover:bg-ink/5'
                      )}
                    >
                      <Icon className="shrink-0" aria-hidden />
                      <span className="flex-1 truncate">{command.label}</span>
                      {command.hint ? (
                        <span className="shrink-0 text-[11px] text-muted">{command.hint}</span>
                      ) : null}
                      {index === cursor ? (
                        <FiCornerDownLeft className="shrink-0 text-xs" aria-hidden />
                      ) : null}
                    </button>
                  );
                })
              )}
            </div>

            <div className="flex items-center gap-4 border-t border-line px-4 py-2.5 text-[11px] text-muted">
              <span>↑ ↓ to navigate</span>
              <span>↵ to select</span>
              <span className="ml-auto">{commands.length} results</span>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
