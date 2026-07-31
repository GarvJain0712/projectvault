import { FiFilm } from 'react-icons/fi';
import useVideoSource from '@/hooks/useVideoSource';
import { Spinner } from './ui/Loader';
import { gradientFromString } from '@/utils/helpers';

/**
 * Large player for the details page.
 * Resolves the source from IndexedDB first, then falls back to a pasted URL.
 */
export default function VideoPlayer({ project }) {
  const { src, loading } = useVideoSource(project);

  if (loading) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-2xl border border-line bg-surface">
        <Spinner />
      </div>
    );
  }

  if (!src) {
    return (
      <div
        className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-2xl text-white"
        style={{ background: gradientFromString(project.title) }}
      >
        <FiFilm className="text-4xl opacity-80" aria-hidden />
        <p className="text-sm font-medium opacity-90">No video attached to this project yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-black shadow-lift">
      <video
        key={src}
        src={src}
        poster={project.thumbnail || undefined}
        controls
        preload="metadata"
        controlsList="nodownload"
        className="aspect-video w-full bg-black"
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
