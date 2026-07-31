import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiArrowLeft,
  FiBookmark,
  FiCheck,
  FiEdit2,
  FiExternalLink,
  FiEye,
  FiFileText,
  FiGithub,
  FiHeart,
  FiShare2,
  FiStar,
  FiTrash2,
} from 'react-icons/fi';
import { DIFFICULTY_STYLES, STATUS_STYLES } from '@/data/constants';
import { useProjects } from '@/context/ProjectContext';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { cx, formatCount, formatDate, formatDuration } from '@/utils/helpers';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import CommentBox from '@/components/CommentBox';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';
import ImageGallery from '@/components/ImageGallery';
import PageTransition from '@/components/ui/PageTransition';
import ProgressBar from '@/components/ui/ProgressBar';
import VideoCard from '@/components/VideoCard';
import VideoPlayer from '@/components/VideoPlayer';
import { Skeleton } from '@/components/ui/Loader';

/** Reusable "section card" used for overview / features / notes. */
function Panel({ title, icon: Icon, children, className }) {
  return (
    <section className={cx('card p-5', className)}>
      {title ? (
        <h2 className="mb-3 flex items-center gap-2 text-[15px] font-semibold text-ink">
          {Icon ? <Icon className="text-accent" aria-hidden /> : null}
          {title}
        </h2>
      ) : null}
      {children}
    </section>
  );
}

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { projects, loading, getProject, registerView, toggleFlag, toggleLike, removeProject } =
    useProjects();
  const { canWrite } = useAuth();

  const project = getProject(id);
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const viewCounted = useRef(null);

  // Count one view per project per mount.
  useEffect(() => {
    if (!project || viewCounted.current === project.id) return;
    viewCounted.current = project.id;
    registerView(project.id);
  }, [project, registerView]);

  // Reset the local "liked" state when navigating between projects.
  useEffect(() => {
    setLiked(false);
  }, [id]);

  /** Related = same category first, then shared technologies. */
  const related = useMemo(() => {
    if (!project) return [];
    return projects
      .filter((candidate) => candidate.id !== project.id)
      .map((candidate) => {
        const sharedTech = (candidate.technologies || []).filter((tech) =>
          (project.technologies || []).includes(tech)
        ).length;
        const score = (candidate.category === project.category ? 3 : 0) + sharedTech;
        return { candidate, score };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((entry) => entry.candidate);
  }, [projects, project]);

  /** Report failures instead of letting a rejected promise vanish. */
  const run = async (action, successMessage) => {
    try {
      await action();
      if (successMessage) toast.success(successMessage);
    } catch (error) {
      toast.error(error?.message || 'That action could not be completed.');
    }
  };

  const handleLike = async () => {
    const next = !liked;
    setLiked(next);
    try {
      await toggleLike(project.id, next);
    } catch (error) {
      setLiked(!next); // roll the optimistic update back
      toast.error(error?.message || 'Could not save your like.');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: project.title, text: project.shortDescription, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied to clipboard');
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not share this link.');
    }
  };

  const handleDelete = async () => {
    try {
      await removeProject(project.id);
      toast.success('Project deleted');
      navigate('/projects');
    } catch (error) {
      toast.error(error?.message || 'Could not delete this project.');
    }
  };

  /* ------------------------------ loading / 404 ---------------------------- */

  if (loading) {
    return (
      <PageTransition className="space-y-5">
        <Skeleton className="aspect-video w-full rounded-2xl" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </PageTransition>
    );
  }

  if (!project) {
    return (
      <PageTransition>
        <EmptyState
          title="Project not found"
          description="This project may have been deleted, or the link is out of date."
          action={{ label: 'Back to all projects', to: '/projects' }}
        />
      </PageTransition>
    );
  }

  /* --------------------------------- render -------------------------------- */

  return (
    <PageTransition className="space-y-5">
      <Link
        to="/projects"
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted transition hover:text-ink"
      >
        <FiArrowLeft /> Back to projects
      </Link>

      <VideoPlayer project={project} />

      {/* Title block */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-2.5 flex flex-wrap items-center gap-2">
            <Badge tone="accent">{project.category}</Badge>
            <Badge className={DIFFICULTY_STYLES[project.difficulty]}>{project.difficulty}</Badge>
            <Badge className={STATUS_STYLES[project.status]}>{project.status}</Badge>
            {project.pinned ? <Badge tone="accent">Pinned</Badge> : null}
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {project.title}
          </h1>

          <p className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted">
            <span className="inline-flex items-center gap-1.5">
              <FiEye aria-hidden /> {formatCount(project.views)} views
            </span>
            <span className="inline-flex items-center gap-1.5">
              <FiHeart aria-hidden /> {formatCount(project.likes)} likes
            </span>
            <span>{formatDate(project.date)}</span>
            {project.duration ? <span>{formatDuration(project.duration)}</span> : null}
          </p>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant={liked ? 'primary' : 'secondary'}
          icon={FiHeart}
          onClick={handleLike}
        >
          {liked ? 'Liked' : 'Like'} · {formatCount(project.likes)}
        </Button>

        {canWrite ? (
          <>
            <Button
              size="sm"
              variant={project.favorite ? 'primary' : 'secondary'}
              icon={FiHeart}
              onClick={() =>
                run(
                  () => toggleFlag(project.id, 'favorite'),
                  project.favorite ? 'Removed from favourites' : 'Added to favourites'
                )
              }
            >
              {project.favorite ? 'Favourited' : 'Favourite'}
            </Button>

            <Button
              size="sm"
              variant={project.watchLater ? 'primary' : 'secondary'}
              icon={FiBookmark}
              onClick={() =>
                run(
                  () => toggleFlag(project.id, 'watchLater'),
                  project.watchLater ? 'Removed from queue' : 'Saved to watch later'
                )
              }
            >
              Watch later
            </Button>

            <Button
              size="sm"
              variant={project.pinned ? 'primary' : 'secondary'}
              icon={FiStar}
              onClick={() =>
                run(
                  () => toggleFlag(project.id, 'pinned'),
                  project.pinned ? 'Unpinned' : 'Pinned to dashboard'
                )
              }
            >
              {project.pinned ? 'Pinned' : 'Pin'}
            </Button>
          </>
        ) : null}

        <Button size="sm" variant="secondary" icon={copied ? FiCheck : FiShare2} onClick={handleShare}>
          {copied ? 'Copied' : 'Share'}
        </Button>

        {canWrite ? (
          <div className="ml-auto flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              icon={FiEdit2}
              to={`/project/${project.id}/edit`}
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="danger-ghost"
              icon={FiTrash2}
              onClick={() => setConfirmOpen(true)}
            >
              Delete
            </Button>
          </div>
        ) : null}
      </div>

      {/* Links */}
      {project.githubUrl || project.demoUrl ? (
        <div className="flex flex-wrap gap-2.5">
          {project.githubUrl ? (
            <Button href={project.githubUrl} icon={FiGithub} size="sm">
              View source on GitHub
            </Button>
          ) : null}
          {project.demoUrl ? (
            <Button href={project.demoUrl} variant="secondary" icon={FiExternalLink} size="sm">
              Open live demo
            </Button>
          ) : null}
        </div>
      ) : null}

      {/* Main content */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {project.longDescription ? (
            <Panel title="Description">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted">
                {project.longDescription}
              </p>
            </Panel>
          ) : null}

          {project.overview ? (
            <Panel title="Project Overview">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted">
                {project.overview}
              </p>
            </Panel>
          ) : null}

          {project.features?.length ? (
            <Panel title="Features">
              <ul className="space-y-2.5">
                {project.features.map((feature, index) => (
                  <motion.li
                    key={feature}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(index * 0.05, 0.3) }}
                    className="flex gap-2.5 text-sm leading-relaxed text-muted"
                  >
                    <FiCheck className="mt-0.5 shrink-0 text-accent" aria-hidden />
                    {feature}
                  </motion.li>
                ))}
              </ul>
            </Panel>
          ) : null}

          <ImageGallery images={project.images} />

          {project.notes ? (
            <Panel title="Project Notes" icon={FiFileText}>
              <div className="rounded-xl border-l-2 border-accent bg-accent/[0.04] p-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted">
                  {project.notes}
                </p>
              </div>
            </Panel>
          ) : null}

          {/* Comments are stored on the project, so posting one is a write. */}
          {canWrite ? <CommentBox project={project} /> : null}
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          {project.status === 'In Progress' ? (
            <Panel title="Completion">
              <ProgressBar value={project.progress} showLabel />
            </Panel>
          ) : null}

          {project.technologies?.length ? (
            <Panel title="Technologies Used">
              <div className="flex flex-wrap gap-1.5">
                {project.technologies.map((tech) => (
                  <Badge key={tech} tone="accent">
                    {tech}
                  </Badge>
                ))}
              </div>
            </Panel>
          ) : null}

          {project.tags?.length ? (
            <Panel title="Tags">
              <div className="flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <Badge key={tag} tone="outline">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </Panel>
          ) : null}

          {project.resources?.length ? (
            <Panel title="Resources" icon={FiFileText}>
              <ul className="space-y-2">
                {project.resources.map((resource) => (
                  <li key={resource.id}>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 rounded-lg border border-line px-3 py-2.5 text-[13px] text-ink transition hover:border-accent hover:bg-accent/[0.04]"
                    >
                      <FiFileText className="shrink-0 text-accent" aria-hidden />
                      <span className="min-w-0 flex-1 truncate">{resource.name}</span>
                      <Badge tone="outline">{resource.type}</Badge>
                    </a>
                  </li>
                ))}
              </ul>
            </Panel>
          ) : null}

          {related.length > 0 ? (
            <Panel title="Related Projects">
              <div className="space-y-1">
                {related.map((item, index) => (
                  <VideoCard key={item.id} project={item} index={index} />
                ))}
              </div>
            </Panel>
          ) : null}
        </aside>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title={`Delete "${project.title}"?`}
        message="The project, its video and all of its comments will be permanently removed."
      />
    </PageTransition>
  );
}
