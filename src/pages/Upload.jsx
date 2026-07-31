import { FiUploadCloud } from 'react-icons/fi';
import PageTransition from '@/components/ui/PageTransition';
import UploadForm from '@/components/UploadForm';
import LockedNotice from '@/components/LockedNotice';
import { useAuth } from '@/context/AuthContext';

export default function Upload() {
  const { canWrite } = useAuth();

  if (!canWrite) {
    return (
      <PageTransition>
        <LockedNotice action="add a project" />
      </PageTransition>
    );
  }

  return (
    <PageTransition className="mx-auto max-w-3xl space-y-5">
      <header>
        <h1 className="flex items-center gap-2.5 text-xl font-semibold tracking-tight text-ink sm:text-2xl">
          <FiUploadCloud className="text-accent" aria-hidden />
          Upload Video
        </h1>
        <p className="mt-1 text-sm text-muted">
          Add a project explanation video along with everything someone would need to understand it.
        </p>
      </header>

      <UploadForm />
    </PageTransition>
  );
}
