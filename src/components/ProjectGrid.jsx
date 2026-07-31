import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import ProjectCard from './ProjectCard';
import { ProjectGridSkeleton } from './ui/Loader';

/**
 * Renders a list of projects in either grid or list mode.
 * Keeps the layout decision in one place so every page stays consistent.
 */
export default function ProjectGrid({ projects, loading = false, skeletonCount = 6 }) {
  const { viewMode } = useTheme();

  if (loading) return <ProjectGridSkeleton count={skeletonCount} />;

  const containerClass =
    viewMode === 'list' ? 'flex flex-col gap-3' : 'grid gap-5 sm:grid-cols-2 xl:grid-cols-3';

  return (
    <motion.div layout className={containerClass}>
      {projects.map((project, index) => (
        <ProjectCard key={project.id} project={project} view={viewMode} index={index} />
      ))}
    </motion.div>
  );
}
