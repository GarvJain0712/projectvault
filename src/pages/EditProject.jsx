import { useParams } from 'react-router-dom';
import { FiEdit2 } from 'react-icons/fi';
import { useProjects } from '@/context/ProjectContext';
import { useAuth } from '@/context/AuthContext';
import EmptyState from '@/components/ui/EmptyState';
import PageTransition from '@/components/ui/PageTransition';
import UploadForm from '@/components/UploadForm';
import LockedNotice from '@/components/LockedNotice';
import { ProjectGridSkeleton } from '@/components/ui/Loader';

export default function EditProject() {
  const { id } = useParams();
  const { getProject, loading } = useProjects();
  const { canWrite } = useAuth();
  const project = getProject(id);

  if (!canWrite) {
    return (
      <PageTransition>
        <LockedNotice action="edit a project" />
      </PageTransition>
    );
  }

  if (loading) {
    return (
      <PageTransition className="mx-auto max-w-3xl">
        <ProjectGridSkeleton count={2} />
      </PageTransition>
    );
  }

  if (!project) {
    return (
      <PageTransition>
        <EmptyState
          title="Project not found"
          description="It may have been deleted, or the link is out of date."
          action={{ label: 'Back to all projects', to: '/projects' }}
        />
      </PageTransition>
    );
  }

  return (
    <PageTransition className="mx-auto max-w-3xl space-y-5">
      <header>
        <h1 className="flex items-center gap-2.5 text-xl font-semibold tracking-tight text-ink sm:text-2xl">
          <FiEdit2 className="text-accent" aria-hidden />
          Edit Project
        </h1>
        <p className="mt-1 text-sm text-muted">Updating “{project.title}”.</p>
      </header>

      {/* `key` forces a fresh form state when navigating between projects */}
      <UploadForm key={project.id} initialProject={project} />
    </PageTransition>
  );
}
