import { useEffect, useRef, useState } from 'react';
import {
  FiAlertTriangle,
  FiCheck,
  FiCloud,
  FiDownload,
  FiDroplet,
  FiGrid,
  FiHardDrive,
  FiList,
  FiMonitor,
  FiMoon,
  FiSun,
  FiUpload,
} from 'react-icons/fi';
import { API_URL, USE_API, checkHealth } from '@/services/apiClient';
import { ACCENT_COLORS } from '@/data/constants';
import { useTheme } from '@/context/ThemeContext';
import { useProjects } from '@/context/ProjectContext';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { cx, downloadFile } from '@/utils/helpers';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import PageTransition from '@/components/ui/PageTransition';

function Section({ title, description, children, hidden = false }) {
  if (hidden) return null;

  return (
    <section className="card p-5 sm:p-6">
      <header className="mb-5">
        <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
        {description ? <p className="mt-1 text-[13px] text-muted">{description}</p> : null}
      </header>
      {children}
    </section>
  );
}

/** Big selectable tile used for theme + view-mode choices. */
function OptionTile({ active, icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cx(
        'flex flex-1 flex-col items-center gap-2 rounded-xl border p-4 text-[13px] font-medium transition',
        active
          ? 'border-accent bg-accent/[0.06] text-accent'
          : 'border-line text-muted hover:border-muted/40 hover:text-ink'
      )}
    >
      <Icon className="text-xl" aria-hidden />
      {label}
    </button>
  );
}

export default function Settings() {
  const { theme, setTheme, accent, setAccent, viewMode, setViewMode, resetSettings } = useTheme();
  const { projects, importProjects, resetEverything } = useProjects();
  const { canWrite } = useAuth();
  const toast = useToast();
  const fileInputRef = useRef(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [health, setHealth] = useState(null);

  // Ask the API whether it (and its database) are reachable.
  useEffect(() => {
    let cancelled = false;
    checkHealth().then((result) => {
      if (!cancelled) setHealth(result);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  /* ------------------------------ import / export -------------------------- */

  const handleExport = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      version: 1,
      count: projects.length,
      // Video blobs live in IndexedDB and are not part of the JSON export.
      projects,
    };
    downloadFile(
      `projectvault-export-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify(payload, null, 2)
    );
    toast.success(`Exported ${projects.length} projects`);
  };

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      const parsed = JSON.parse(await file.text());
      const incoming = Array.isArray(parsed) ? parsed : parsed.projects;
      if (!Array.isArray(incoming)) throw new Error('Unexpected file shape');

      await importProjects(incoming);
      toast.success(`Imported ${incoming.length} projects`);
    } catch {
      toast.error('That file could not be read as a ProjectVault export.');
    }
  };

  const handleReset = async () => {
    await resetEverything();
    resetSettings();
    toast.success('All local data cleared');
  };

  return (
    <PageTransition className="mx-auto max-w-3xl space-y-5">
      <header>
        <h1 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">Settings</h1>
        <p className="mt-1 text-sm text-muted">
          Preferences are saved in your browser and apply the moment you change them.
        </p>
      </header>

      <Section title="Appearance" description="Choose how ProjectVault looks.">
        <div className="flex gap-3">
          <OptionTile
            active={theme === 'light'}
            icon={FiSun}
            label="Light"
            onClick={() => setTheme('light')}
          />
          <OptionTile
            active={theme === 'dark'}
            icon={FiMoon}
            label="Dark"
            onClick={() => setTheme('dark')}
          />
          <OptionTile
            active={theme === 'system'}
            icon={FiMonitor}
            label="System"
            onClick={() => setTheme('system')}
          />
        </div>
      </Section>

      <Section title="Accent colour" description="Used for highlights, buttons and charts.">
        <div className="flex flex-wrap gap-3">
          {ACCENT_COLORS.map((color) => (
            <button
              key={color.name}
              type="button"
              onClick={() => setAccent(color.value)}
              aria-label={color.name}
              aria-pressed={accent === color.value}
              className={cx(
                'flex h-10 w-10 items-center justify-center rounded-xl transition',
                accent === color.value ? 'ring-2 ring-offset-2 ring-offset-bg' : 'hover:scale-105'
              )}
              style={{
                background: `rgb(${color.value})`,
                boxShadow: accent === color.value ? `0 0 0 2px rgb(${color.value})` : undefined,
              }}
            >
              {accent === color.value ? <FiCheck className="text-white" /> : null}
            </button>
          ))}
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
          <FiDroplet aria-hidden />
          {ACCENT_COLORS.find((color) => color.value === accent)?.name || 'Custom'} is active.
        </p>
      </Section>

      <Section title="Default layout" description="How project listings are rendered.">
        <div className="flex gap-3">
          <OptionTile
            active={viewMode === 'grid'}
            icon={FiGrid}
            label="Grid view"
            onClick={() => setViewMode('grid')}
          />
          <OptionTile
            active={viewMode === 'list'}
            icon={FiList}
            label="List view"
            onClick={() => setViewMode('list')}
          />
        </div>
      </Section>

      <Section
        title="Storage"
        description="Where your projects and videos are being saved right now."
      >
        <div className="flex items-start gap-3.5 rounded-xl border border-line bg-surface p-4">
          <div
            className={cx(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg',
              USE_API ? 'bg-accent/10 text-accent' : 'bg-amber-500/10 text-amber-500'
            )}
          >
            {USE_API ? <FiCloud aria-hidden /> : <FiHardDrive aria-hidden />}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium text-ink">
              {USE_API ? 'Server mode' : 'This browser only'}
            </p>

            {USE_API ? (
              <>
                <p className="mt-1 break-all text-xs text-muted">{API_URL}</p>
                <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className={cx(
                        'h-1.5 w-1.5 rounded-full',
                        health === null
                          ? 'bg-muted'
                          : health.ok
                            ? 'bg-emerald-500'
                            : 'bg-rose-500'
                      )}
                    />
                    <span className="text-muted">
                      {health === null
                        ? 'checking…'
                        : health.ok
                          ? 'API reachable'
                          : `API unreachable — ${health.error || 'no response'}`}
                    </span>
                  </span>
                  {health?.ok ? (
                    <>
                      <span className="text-muted">database: {health.database}</span>
                      <span className="text-muted">files: {health.storage}</span>
                      <span className={health.writeProtected ? 'text-muted' : 'text-amber-500'}>
                        writes: {health.writeProtected ? 'key required' : 'open'}
                      </span>
                    </>
                  ) : null}
                </p>
              </>
            ) : (
              <p className="mt-1 text-xs leading-relaxed text-muted">
                Projects are in localStorage and videos in IndexedDB, so they stay on this
                device. To share them across devices, set <code className="text-accent">VITE_API_URL</code>{' '}
                in <code className="text-accent">.env</code> and start the server in{' '}
                <code className="text-accent">server/</code>.
              </p>
            )}
          </div>
        </div>
      </Section>

      <Section
        title="Your data"
        description={
          USE_API
            ? 'Export a backup, or import projects from another vault.'
            : 'Everything lives in this browser. Export a backup, or move your vault to another machine.'
        }
      >
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" size="sm" icon={FiDownload} onClick={handleExport}>
            Export as JSON
          </Button>
          {canWrite ? (
            <Button
              variant="secondary"
              size="sm"
              icon={FiUpload}
              onClick={() => fileInputRef.current?.click()}
            >
              Import from JSON
            </Button>
          ) : null}
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={handleImport}
            className="hidden"
          />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted">
          Note: uploaded video files are stored separately in IndexedDB and are not included in the
          JSON export — links, metadata, notes and comments are.
        </p>
      </Section>

      <Section title="Danger zone" description="This cannot be undone." hidden={!canWrite}>
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-500/[0.04] p-4">
          <FiAlertTriangle className="text-lg text-rose-500" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium text-ink">Reset all data</p>
            <p className="mt-0.5 text-xs text-muted">
              Deletes every project, video, comment and preference from this browser.
            </p>
          </div>
          <Button variant="danger" size="sm" onClick={() => setConfirmReset(true)}>
            Reset
          </Button>
        </div>
      </Section>

      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={handleReset}
        title="Reset everything?"
        message="All projects, uploaded videos, comments and settings will be permanently deleted from this browser. Export a backup first if you want to keep them."
        confirmLabel="Yes, delete everything"
      />
    </PageTransition>
  );
}
