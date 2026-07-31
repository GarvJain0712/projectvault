import { useMemo } from 'react';
import { FiBookmark, FiClock, FiPlus } from 'react-icons/fi';
import { useProjects } from '@/context/ProjectContext';
import useProjectFilters from '@/hooks/useProjectFilters';
import { formatWatchTime } from '@/utils/helpers';
import EmptyState from '@/components/ui/EmptyState';
import FilterBar from '@/components/FilterBar';
import PageTransition from '@/components/ui/PageTransition';
import ProjectGrid from '@/components/ProjectGrid';
import SearchBar from '@/components/SearchBar';

export default function WatchLater() {
  const { projects, loading } = useProjects();

  const saved = useMemo(() => projects.filter((project) => project.watchLater), [projects]);
  const { filters, setFilter, resetFilters, filtered, technologyOptions, activeFilterCount } =
    useProjectFilters(saved);

  const queueLength = saved.reduce((sum, project) => sum + (project.duration || 0), 0);

  return (
    <PageTransition className="space-y-5">
      <header>
        <h1 className="flex items-center gap-2.5 text-xl font-semibold tracking-tight text-ink sm:text-2xl">
          <FiBookmark className="text-accent" aria-hidden />
          Watch Later
        </h1>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 text-sm text-muted">
          <span>
            {saved.length} video{saved.length === 1 ? '' : 's'} queued
          </span>
          {queueLength > 0 ? (
            <span className="inline-flex items-center gap-1">
              <FiClock aria-hidden /> {formatWatchTime(queueLength)} total
            </span>
          ) : null}
        </p>
      </header>

      {saved.length > 0 ? (
        <>
          <SearchBar
            value={filters.query}
            onChange={(value) => setFilter('query', value)}
            placeholder="Search your queue…"
          />
          <FilterBar
            filters={filters}
            setFilter={setFilter}
            onReset={resetFilters}
            technologyOptions={technologyOptions}
            activeFilterCount={activeFilterCount}
            resultCount={filtered.length}
          />
        </>
      ) : null}

      {loading || filtered.length > 0 ? (
        <ProjectGrid projects={filtered} loading={loading} skeletonCount={3} />
      ) : saved.length > 0 ? (
        <EmptyState
          title="Nothing in the queue matches your filters"
          action={{ label: 'Clear filters', onClick: resetFilters }}
        />
      ) : (
        <EmptyState
          icon={FiBookmark}
          title="Your watch-later queue is empty"
          description="Use the bookmark button on any project to save it here for later."
          action={{ label: 'Browse projects', to: '/projects' }}
          secondaryAction={{ label: 'Add a project', to: '/upload', icon: FiPlus }}
        />
      )}
    </PageTransition>
  );
}
