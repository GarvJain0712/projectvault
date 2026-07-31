import { useEffect, useState } from 'react';
import { getVideo } from '@/services/videoStore';

/**
 * Resolves a playable src for a project.
 * Prefers the uploaded blob in IndexedDB, falls back to a pasted URL.
 * Object URLs are revoked on unmount so we don't leak memory.
 */
export default function useVideoSource(project) {
  const [src, setSrc] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let objectUrl = '';
    let cancelled = false;

    async function resolve() {
      setLoading(true);

      if (project?.videoKey) {
        const blob = await getVideo(project.videoKey);
        if (blob && !cancelled) {
          objectUrl = URL.createObjectURL(blob);
          setSrc(objectUrl);
          setLoading(false);
          return;
        }
      }

      if (!cancelled) {
        setSrc(project?.videoUrl || '');
        setLoading(false);
      }
    }

    resolve();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [project?.videoKey, project?.videoUrl]);

  return { src, loading };
}
