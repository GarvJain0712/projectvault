import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiArrowRight,
  FiClock,
  FiEye,
  FiFolder,
  FiGithub,
  FiHeart,
  FiLayers,
  FiPlay,
  FiPlus,
  FiUploadCloud,
  FiVideo,
} from 'react-icons/fi';
import { CATEGORIES } from '@/data/constants';
import { PROFILE } from '@/data/profile';
import { useProjects } from '@/context/ProjectContext';
import {
  formatCount,
  formatRelativeTime,
  formatWatchTime,
  gradientFromString,
  initialsOf,
} from '@/utils/helpers';
import ActivityTimeline from '@/components/ActivityTimeline';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import CategoryChart from '@/components/CategoryChart';
import CategoryChips from '@/components/CategoryChips';
import EmptyState from '@/components/ui/EmptyState';
import PageTransition from '@/components/ui/PageTransition';
import SearchBar from '@/components/SearchBar';
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
          <span className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-accent shadow-lift">
              <FiPlay className="ml-1 text-2xl" />
            </span>
          </span>
        </Link>

        <div className="flex flex-col justify-center gap-4 p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="accent">Featured</Badge>
            <Badge>{project.category}</Badge>
          </div>

          <div>
            <h2 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">
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

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button to={`/project/${project.id}`} icon={FiPlay} size="sm">
              Watch explanation
            </Button>
            {project.githubUrl ? (
              <Button href={project.githubUrl} variant="secondary" size="sm" icon={FiGithub}>
                Source
              </Button>
            ) : null}
            <span className="ml-auto flex items-center gap-1 text-xs text-muted">
              <FiEye aria-hidden /> {formatCount(project.views)} views
            </span>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

export default function Dashboard() {
  const { projects, activity, loading, stats } = useProjects();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');

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

  const categoryCounts = useMemo(() => {
    const counts = {};
    projects.forEach((project) => {
      counts[project.category] = (counts[project.category] || 0) + 1;
    });
    return counts;
  }, [projects]);

  /** Quick client-side filter for the dashboard preview grid. */
  const preview = useMemo(() => {
    const term = query.trim().toLowerCase();
    return projects
      .filter((project) => (category === 'All' ? true : project.category === category))
      .filter((project) =>
        term
          ? `${project.title} ${project.shortDescription} ${(project.technologies || []).join(' ')}`
              .toLowerCase()
              .includes(term)
          : true
      )
      .sort((a, b) => Number(b.pinned) - Number(a.pinned) || new Date(b.date) - new Date(a.date))
      .slice(0, 6);
  }, [projects, query, category]);

  const statCards = [
    { icon: FiFolder, label: 'Projects', value: stats.totalProjects, accent: 'accent' },
    { icon: FiVideo, label: 'Videos', value: stats.totalVideos, accent: 'violet' },
    { icon: FiLayers, label: 'Categories', value: stats.totalCategories, accent: 'blue' },
    { icon: FiHeart, label: 'Favorites', value: stats.totalFavorites, accent: 'rose' },
    {
      icon: FiClock,
      label: 'Total watch time',
      value: formatWatchTime(stats.totalWatchSeconds),
      accent: 'amber',
    },
    { icon: FiEye, label: 'Total views', value: formatCount(stats.totalViews), accent: 'emerald' },
  ];

  return (
    <PageTransition className="space-y-6">
      {/* Hero */}
      <section className="hero-wash relative overflow-hidden rounded-2xl border border-line p-6 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-2xl"
        >
          <p className="text-[13px] font-medium text-accent">{greeting()}, {PROFILE.name.split(' ')[0]}</p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Your project vault
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
            {stats.totalProjects > 0
              ? `${stats.totalProjects} projects, ${stats.totalVideos} explanation videos and ${formatWatchTime(
                  stats.totalWatchSeconds
                )} of footage — all searchable in one place.`
              : 'Start by uploading your first project explanation video.'}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button to="/upload" icon={FiPlus} size="sm">
              Add project
            </Button>
            <Button to="/projects" variant="secondary" size="sm" iconRight={FiArrowRight}>
              Browse library
            </Button>
          </div>
        </motion.div>

        {stats.latestUpload ? (
          <p className="mt-6 text-xs text-muted">
            Latest upload:{' '}
            <Link to={`/project/${stats.latestUpload.id}`} className="font-medium text-accent hover:underline">
              {stats.latestUpload.title}
            </Link>{' '}
            · {formatRelativeTime(stats.latestUpload.createdAt)}
          </p>
        ) : null}
      </section>

      {/* Statistics */}
      {loading ? (
        <StatsSkeleton count={6} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {statCards.map((card, index) => (
            <StatisticsCard key={card.label} index={index} {...card} />
          ))}
        </div>
      )}

      {/* Featured */}
      {!loading ? <FeaturedProject project={featured} /> : null}

      {/* Charts + recent + activity */}
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

      {!loading && projects.length > 0 ? (
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <ActivityTimeline items={activity} />
          </div>

          <div className="space-y-4 lg:col-span-2">
            <div className="flex flex-col gap-3">
              <SearchBar value={query} onChange={setQuery} />
              <CategoryChips
                categories={CATEGORIES}
                value={category}
                onChange={setCategory}
                counts={categoryCounts}
              />
            </div>

            {preview.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {preview.map((project, index) => (
                  <VideoCard key={project.id} project={project} index={index} />
                ))}
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-line p-8 text-center text-sm text-muted">
                No projects match that filter.
              </p>
            )}
          </div>
        </div>
      ) : null}

      {/* Loading / empty */}
      {loading ? <ProjectGridSkeleton count={3} /> : null}

      {!loading && projects.length === 0 ? (
        <EmptyState
          icon={FiUploadCloud}
          title="Your vault is empty"
          description="Upload your first project explanation video and it will show up here, fully searchable."
          action={{ label: 'Upload a video', to: '/upload', icon: FiPlus }}
          secondaryAction={{ label: 'About me', to: '/about' }}
        />
      ) : null}
    </PageTransition>
  );
}
