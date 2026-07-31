import { useMemo } from 'react';
import { FiHeart, FiPlus } from 'react-icons/fi';
import { useProjects } from '@/context/ProjectContext';
import useProjectFilters from '@/hooks/useProjectFilters';
import EmptyState from '@/components/ui/EmptyState';
import FilterBar from '@/components/FilterBar';
import PageTransition from '@/components/ui/PageTransition';
import ProjectGrid from '@/components/ProjectGrid';
import SearchBar from '@/components/SearchBar';

export default function Favorites() {
  const { projects, loading } = useProjects();

  const favorites = useMemo(() => projects.filter((project) => project.favorite), [projects]);
  const { filters, setFilter, resetFilters, filtered, technologyOptions, activeFilterCount } =
    useProjectFilters(favorites);

  return (
    <PageTransition className="space-y-5">
      <header>
        <h1 className="flex items-center gap-2.5 text-xl font-semibold tracking-tight text-ink sm:text-2xl">
          <FiHeart className="text-rose-500" aria-hidden />
          Favorites
        </h1>
        <p className="mt-1 text-sm text-muted">
          {favorites.length} project{favorites.length === 1 ? '' : 's'} you marked as a favourite
        </p>
      </header>

      {favorites.length > 0 ? (
        <>
          <SearchBar
            value={filters.query}
            onChange={(value) => setFilter('query', value)}
            placeholder="Search your favourites…"
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
      ) : favorites.length > 0 ? (
        <EmptyState
          title="No favourites match your filters"
          description="Clear the filters to see all of your favourites."
          action={{ label: 'Clear filters', onClick: resetFilters }}
        />
      ) : (
        <EmptyState
          icon={FiHeart}
          title="No favourites yet"
          description="Tap the heart on any project card and it will be collected here for quick access."
          action={{ label: 'Browse projects', to: '/projects' }}
          secondaryAction={{ label: 'Add a project', to: '/upload', icon: FiPlus }}
        />
      )}
    </PageTransition>
  );
}
