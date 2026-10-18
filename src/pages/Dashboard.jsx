import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiArrowRight,
  FiClock,
  FiEye,
  FiFolder,
  FiGithub,
  FiLayers,
  FiPlay,
  FiPlus,
  FiUploadCloud,
  FiVideo,
} from 'react-icons/fi';
import { PROFILE } from '@/data/profile';
import { useProjects } from '@/context/ProjectContext';
import { useAuth } from '@/context/AuthContext';
import {
  formatCount,
  formatRelativeTime,
  formatWatchTime,
  gradientFromString,
  initialsOf,
} from '@/utils/helpers';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import CategoryChart from '@/components/CategoryChart';
import EmptyState from '@/components/ui/EmptyState';
import PageTransition from '@/components/ui/PageTransition';
import StatisticsCard from '@/components/StatisticsCard';
import VideoCard from '@/components/VideoCard';
import { ProjectGridSkeleton, StatsSkeleton } from '@/components/ui/Loader';

/** Greeting that matches the time of day. */
function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

/** Big highlighted card for the pinned / most-viewed project. */
function FeaturedProject({ project }) {
  if (!project) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="card overflow-hidden"
    >
      <div className="grid md:grid-cols-2">
        <Link
          to={`/project/${project.id}`}
          className="group relative aspect-video overflow-hidden md:aspect-auto md:min-h-[15rem]"
        >
          {project.thumbnail ? (
            <img
              src={project.thumbnail}
              alt=""
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center"
              style={{ background: gradientFromString(project.title) }}
              aria-hidden
            >
              <span className="text-4xl font-bold text-white/90">{initialsOf(project.title)}</span>
            </div>
          )}
          <span className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f9c00f] text-black border-2 border-line shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform group-hover:scale-110">
              <FiPlay className="ml-1 text-2xl fill-current" />
            </span>
          </span>
        </Link>

        <div className="flex flex-col justify-center gap-4 p-5 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="accent">Featured</Badge>
            <Badge>{project.category}</Badge>
          </div>

          <div>
            <h2 className="text-lg font-semibold tracking-tight text-ink sm:text-2xl">
              {project.title}
            </h2>
            <p className="clamp-3 mt-2 text-sm leading-relaxed text-muted">
              {project.longDescription || project.shortDescription}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(project.technologies || []).slice(0, 4).map((tech) => (
              <Badge key={tech}>{tech}</Badge>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <Button to={`/project/${project.id}`} icon={FiPlay} size="sm">
              Watch
            </Button>
            {project.githubUrl ? (
              <Button href={project.githubUrl} variant="secondary" size="sm" icon={FiGithub}>
                Source
              </Button>
            ) : null}
            <span className="ml-auto flex shrink-0 items-center gap-1 text-xs text-muted">
              <FiEye aria-hidden /> {formatCount(project.views)}
            </span>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

export default function Dashboard() {
  const { projects, loading, stats } = useProjects();
  const { canWrite } = useAuth();

  /** Featured = the first pinned project, otherwise the most watched. */
  const featured = useMemo(() => {
    if (projects.length === 0) return null;
    return (
      projects.find((project) => project.pinned) ||
      [...projects].sort((a, b) => (b.views || 0) - (a.views || 0))[0]
    );
  }, [projects]);

  const recent = useMemo(
    () => [...projects].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5),
    [projects]
  );

  const statCards = [
    { icon: FiFolder, label: 'Projects', value: stats.totalProjects, accent: 'accent' },
    { icon: FiVideo, label: 'Videos', value: stats.totalVideos, accent: 'violet' },
    { icon: FiLayers, label: 'Categories', value: stats.totalCategories, accent: 'blue' },
    {
      icon: FiClock,
      label: 'Watch time',
      value: formatWatchTime(stats.totalWatchSeconds),
      accent: 'amber',
    },
  ];

  return (
    <PageTransition className="space-y-5">
      {/* Hero */}
      <section className="hero-wash relative overflow-hidden rounded-2xl border border-line p-5 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-2xl"
        >
          <p className="text-[13px] font-medium text-accent">
            {greeting()}, {PROFILE.name.split(' ')[0]}
          </p>
          <h1 className="mt-1.5 text-xl font-semibold tracking-tight text-ink sm:text-3xl">
            Your project vault
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
            {stats.totalProjects > 0
              ? `${stats.totalProjects} project${stats.totalProjects === 1 ? '' : 's'}, ${
                  stats.totalVideos
                } explanation video${stats.totalVideos === 1 ? '' : 's'}, all searchable in one place.`
              : 'Start by uploading your first project explanation video.'}
          </p>

          <div className="mt-5 flex flex-wrap gap-2.5">
            {canWrite ? (
              <Button to="/upload" icon={FiPlus} size="sm">
                Add project
              </Button>
            ) : null}
            <Button to="/projects" variant="secondary" size="sm" iconRight={FiArrowRight}>
              Browse library
            </Button>
          </div>
        </motion.div>

        {stats.latestUpload ? (
          <p className="mt-6 truncate text-xs text-muted">
            Latest:{' '}
            <Link
              to={`/project/${stats.latestUpload.id}`}
              className="font-medium text-accent hover:underline"
            >
              {stats.latestUpload.title}
            </Link>{' '}
            · {formatRelativeTime(stats.latestUpload.createdAt)}
          </p>
        ) : null}
      </section>

      {/* Statistics — 2 across on phones, 4 on desktop */}
      {loading ? (
        <StatsSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {statCards.map((card, index) => (
            <StatisticsCard key={card.label} index={index} {...card} />
          ))}
        </div>
      )}

      {/* Featured */}
      {!loading ? <FeaturedProject project={featured} /> : null}

      {/* Breakdown + recent uploads */}
      {!loading && projects.length > 0 ? (
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <CategoryChart projects={projects} />
          </div>

          <section className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-ink">Recently Added</h2>
              <Link to="/projects" className="text-xs font-medium text-accent hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-1">
              {recent.map((project, index) => (
                <VideoCard key={project.id} project={project} index={index} />
              ))}
            </div>
          </section>
        </div>
      ) : null}

      {/* Loading / empty */}
      {loading ? <ProjectGridSkeleton count={3} /> : null}

      {!loading && projects.length === 0 ? (
        <EmptyState
          icon={FiUploadCloud}
          title="Your vault is empty"
          description="Upload your first project explanation video and it will show up here, fully searchable."
          action={canWrite ? { label: 'Upload a video', to: '/upload', icon: FiPlus } : undefined}
          secondaryAction={{ label: 'About me', to: '/about' }}
        />
      ) : null}
    </PageTransition>
  );
}
