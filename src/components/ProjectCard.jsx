import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiBookmark,
  FiEdit2,
  FiEye,
  FiHeart,
  FiPlay,
  FiTrash2,
} from 'react-icons/fi';
import { DIFFICULTY_STYLES, STATUS_STYLES } from '@/data/constants';
import { useProjects } from '@/context/ProjectContext';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import {
  cx,
  formatCount,
  formatDate,
  formatDuration,
  gradientFromString,
  initialsOf,
} from '@/utils/helpers';
import Badge from './ui/Badge';
import Button from './ui/Button';
import ConfirmDialog from './ui/ConfirmDialog';
import ProgressBar from './ui/ProgressBar';
import Tooltip from './ui/Tooltip';

/** Thumbnail image, or a generated gradient + initials when none was uploaded. */
function Thumbnail({ project, className }) {
  if (project.thumbnail) {
    return (
      <img
        src={project.thumbnail}
        alt=""
        loading="lazy"
        className={cx('h-full w-full object-cover', className)}
      />
    );
  }

  return (
    <div
      className={cx('flex h-full w-full items-center justify-center', className)}
      style={{ background: gradientFromString(project.title) }}
      aria-hidden
    >
      <span className="text-2xl font-bold tracking-tight text-white/90">
        {initialsOf(project.title)}
      </span>
    </div>
  );
}

/** Small circular icon button used for favourite / watch-later / edit / delete. */
function IconAction({ label, icon: Icon, active, tone = 'default', onClick }) {
  const tones = {
    default: active ? 'text-accent bg-accent/10' : 'text-muted hover:text-ink hover:bg-ink/5',
    rose: active ? 'text-rose-500 bg-rose-500/10' : 'text-muted hover:text-rose-500 hover:bg-rose-500/10',
    danger: 'text-muted hover:text-rose-500 hover:bg-rose-500/10',
  };

  return (
    <Tooltip label={label}>
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onClick();
        }}
        aria-label={label}
        aria-pressed={active}
        className={cx(
          'flex h-8 w-8 items-center justify-center rounded-lg transition',
          tones[tone]
        )}
      >
        <Icon className={cx(active && tone === 'rose' && 'fill-current')} />
      </button>
    </Tooltip>
  );
}

/**
 * The main project card. Supports two layouts:
 *   view="grid"  → vertical card with a 16:9 thumbnail
 *   view="list"  → horizontal row
 */
export default function ProjectCard({ project, view = 'grid', index = 0 }) {
  const { toggleFlag, removeProject } = useProjects();
  const toast = useToast();
  const navigate = useNavigate();
  const { canWrite } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const detailsPath = `/project/${project.id}`;

  /**
   * In API mode any of these can fail (server down, network blip), so every
   * action reports the outcome instead of failing silently.
   */
  const run = async (action, successMessage) => {
    try {
      await action();
      toast.success(successMessage);
    } catch (error) {
      toast.error(error?.message || 'That action could not be completed.');
    }
  };

  const handleFavorite = () =>
    run(
      () => toggleFlag(project.id, 'favorite'),
      project.favorite ? 'Removed from favourites' : `"${project.title}" added to favourites`
    );

  const handleWatchLater = () =>
    run(
      () => toggleFlag(project.id, 'watchLater'),
      project.watchLater ? 'Removed from watch later' : 'Saved to watch later'
    );

  const handleDelete = () =>
    run(() => removeProject(project.id), `"${project.title}" deleted`);

  // Hidden while locked: visitors get a clean read-only card.
  const actions = !canWrite ? null : (
    <>
      <IconAction
        label={project.favorite ? 'Remove from favourites' : 'Add to favourites'}
        icon={FiHeart}
        tone="rose"
        active={project.favorite}
        onClick={handleFavorite}
      />
      <IconAction
        label={project.watchLater ? 'Remove from watch later' : 'Watch later'}
        icon={FiBookmark}
        active={project.watchLater}
        onClick={handleWatchLater}
      />
      <IconAction
        label="Edit project"
        icon={FiEdit2}
        onClick={() => navigate(`/project/${project.id}/edit`)}
      />
      <IconAction label="Delete project" icon={FiTrash2} tone="danger" onClick={() => setConfirmOpen(true)} />
    </>
  );

  const meta = (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted">
      <span className="inline-flex items-center gap-1">
        <FiEye aria-hidden /> {formatCount(project.views)}
      </span>
      <span>{formatDate(project.date)}</span>
      {project.duration ? <span>{formatDuration(project.duration)}</span> : null}
    </div>
  );

  const techBadges = (limit) => (
    <div className="flex flex-wrap gap-1.5">
      {(project.technologies || []).slice(0, limit).map((tech) => (
        <Badge key={tech}>{tech}</Badge>
      ))}
      {(project.technologies || []).length > limit ? (
        <Badge tone="outline">+{project.technologies.length - limit}</Badge>
      ) : null}
    </div>
  );

  /* ------------------------------- list view ------------------------------ */
  if (view === 'list') {
    return (
      <>
        <motion.article
          layout
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.24) }}
          className="card group flex gap-4 p-3 transition-shadow hover:shadow-lift"
        >
          <Link
            to={detailsPath}
            className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-xl xs:w-36 sm:w-52"
          >
            <Thumbnail
              project={project}
              className="transition-transform duration-500 group-hover:scale-105"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 transition-opacity group-hover:opacity-100">
              <FiPlay className="text-2xl text-white" />
            </span>
          </Link>

          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <Link to={detailsPath} className="block">
                  <h3 className="clamp-1 text-[15px] font-semibold text-ink transition-colors group-hover:text-accent">
                    {project.title}
                  </h3>
                </Link>
                <p className="clamp-2 mt-1 text-[13px] leading-relaxed text-muted">
                  {project.shortDescription}
                </p>
              </div>
              <div className="hidden shrink-0 items-center gap-1 sm:flex">{actions}</div>
            </div>

            <div className="mt-auto flex flex-wrap items-center gap-2">
              <Badge tone="accent">{project.category}</Badge>
              <Badge className={DIFFICULTY_STYLES[project.difficulty]}>{project.difficulty}</Badge>
              <div className="hidden sm:contents">{techBadges(3)}</div>
              <div className="w-full sm:ml-auto sm:w-auto">{meta}</div>
            </div>

            {/* Row actions move below the text on phones so nothing overflows */}
            <div className="flex items-center gap-1 sm:hidden">{actions}</div>
          </div>
        </motion.article>

        <ConfirmDialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={handleDelete}
          title={`Delete "${project.title}"?`}
          message="The project, its video and all of its comments will be permanently removed."
        />
      </>
    );
  }

  /* ------------------------------- grid view ------------------------------ */
  return (
    <>
      <motion.article
        layout
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.3) }}
        className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-lift"
      >
        <Link to={detailsPath} className="relative block aspect-video overflow-hidden">
          <Thumbnail
            project={project}
            className="transition-transform duration-500 group-hover:scale-105"
          />

          {/* Play overlay */}
          <span className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-accent shadow-lift backdrop-blur">
              <FiPlay className="ml-0.5 text-xl" />
            </span>
          </span>

          {project.duration ? (
            <span className="absolute bottom-2 right-2 rounded-md bg-black/75 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-white">
              {formatDuration(project.duration)}
            </span>
          ) : null}

          {project.pinned ? (
            <span className="absolute left-2 top-2 rounded-md bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-ink">
              Pinned
            </span>
          ) : null}
        </Link>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              <Badge tone="accent">{project.category}</Badge>
              <Badge className={DIFFICULTY_STYLES[project.difficulty]}>{project.difficulty}</Badge>
              {project.status !== 'Completed' ? (
                <Badge className={STATUS_STYLES[project.status]}>{project.status}</Badge>
              ) : null}
            </div>

            <Link to={detailsPath}>
              <h3 className="clamp-1 text-[15px] font-semibold text-ink transition-colors group-hover:text-accent">
                {project.title}
              </h3>
            </Link>
            <p className="clamp-2 mt-1.5 text-[13px] leading-relaxed text-muted">
              {project.shortDescription}
            </p>
          </div>

          {techBadges(3)}

          {project.status === 'In Progress' ? <ProgressBar value={project.progress} /> : null}

          <div className="mt-auto space-y-3 pt-1">
            {meta}
            <div className="flex items-center gap-1 border-t border-line pt-3">
              <Button
                size="sm"
                variant="subtle"
                to={detailsPath}
                icon={FiPlay}
                className="mr-auto"
              >
                View Details
              </Button>
              {actions}
            </div>
          </div>
        </div>
      </motion.article>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title={`Delete "${project.title}"?`}
        message="The project, its video and all of its comments will be permanently removed."
      />
    </>
  );
}
