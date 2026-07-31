import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
import { API_URL, USE_API } from '@/services/apiClient';
import { useProjects } from '@/context/ProjectContext';
import Button from './ui/Button';

/**
 * Shown when the app is in API mode but the server or database can't be
 * reached. Without this the UI would just sit on loading skeletons with no
 * explanation of what went wrong.
 */
export default function ConnectionBanner() {
  const { error, reload, loading } = useProjects();

  if (!error) return null;

  return (
    <div className="mb-5 flex flex-wrap items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-4">
      <FiAlertTriangle className="mt-0.5 shrink-0 text-lg text-amber-500" aria-hidden />

      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-ink">
          {USE_API ? 'Cannot reach the server' : 'Could not load your projects'}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted">{error}</p>

        {USE_API ? (
          <p className="mt-2 text-xs leading-relaxed text-muted">
            Check that the API is running at <code className="text-accent">{API_URL}</code> — start
            it with <code className="text-accent">npm run dev</code> inside the{' '}
            <code className="text-accent">server/</code> folder.
          </p>
        ) : null}
      </div>

      <Button size="sm" variant="secondary" icon={FiRefreshCw} onClick={reload} disabled={loading}>
        Retry
      </Button>
    </div>
  );
}
