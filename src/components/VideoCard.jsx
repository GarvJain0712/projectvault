import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiEye, FiPlay } from 'react-icons/fi';
import {
  formatCount,
  formatDuration,
  formatRelativeTime,
  gradientFromString,
  initialsOf,
} from '@/utils/helpers';

/**
 * Compact horizontal video row — used for "Recently added" on the dashboard.
 * Deliberately lighter than ProjectCard: thumbnail, title, one line of meta.
 */
export default function VideoCard({ project, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.28, delay: Math.min(index * 0.05, 0.3) }}
    >
      <Link
        to={`/project/${project.id}`}
        className="group flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-ink/[0.04] dark:hover:bg-white/[0.04]"
      >
        <div className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-lg">
          {project.thumbnail ? (
            <img src={project.thumbnail} alt="" loading="lazy" className="h-full w-full object-cover" />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center text-sm font-bold text-white/90"
              style={{ background: gradientFromString(project.title) }}
              aria-hidden
            >
              {initialsOf(project.title)}
            </div>
          )}
          <span className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
            <FiPlay className="text-white" />
          </span>
          {project.duration ? (
            <span className="absolute bottom-1 right-1 rounded bg-black/75 px-1 text-[10px] tabular-nums text-white">
              {formatDuration(project.duration)}
            </span>
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="clamp-1 text-[13.5px] font-medium text-ink transition-colors group-hover:text-accent">
            {project.title}
          </h4>
          <p className="mt-0.5 text-[11.5px] text-muted">{project.category}</p>
          <p className="mt-0.5 flex items-center gap-2 text-[11px] text-muted">
            <span className="inline-flex items-center gap-1">
              <FiEye aria-hidden /> {formatCount(project.views)}
            </span>
            <span aria-hidden>·</span>
            <span>{formatRelativeTime(project.createdAt)}</span>
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
