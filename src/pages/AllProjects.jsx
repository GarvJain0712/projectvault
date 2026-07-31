import { useMemo } from 'react';
import { FiFolder, FiPlus, FiSearch } from 'react-icons/fi';
import { CATEGORIES } from '@/data/constants';
import { useProjects } from '@/context/ProjectContext';
import useProjectFilters from '@/hooks/useProjectFilters';
import usePagination from '@/hooks/usePagination';
import Button from '@/components/ui/Button';
import CategoryChips from '@/components/CategoryChips';
import EmptyState from '@/components/ui/EmptyState';
import FilterBar from '@/components/FilterBar';
import PageTransition from '@/components/ui/PageTransition';
import Pagination from '@/components/ui/Pagination';
import ProjectGrid from '@/components/ProjectGrid';
import SearchBar from '@/components/SearchBar';

export default function AllProjects() {
  const { projects, loading } = useProjects();
  const { filters, setFilter, resetFilters, filtered, technologyOptions, activeFilterCount } =
    useProjectFilters(projects);
  const { page, setPage, totalPages, pageItems } = usePagination(filtered);

  const categoryCounts = useMemo(() => {
    const counts = {};
    projects.forEach((project) => {
      counts[project.category] = (counts[project.category] || 0) + 1;
    });
    return counts;
  }, [projects]);

  const hasProjects = projects.length > 0;

  return (
    <PageTransition className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">All Projects</h1>
          <p className="mt-1 text-sm text-muted">
            {hasProjects
              ? `${projects.length} project${projects.length === 1 ? '' : 's'} in your vault`
              : 'Nothing here yet'}
          </p>
        </div>
        <Button to="/upload" icon={FiPlus} size="sm">
          Add project
        </Button>
      </header>

      {hasProjects ? (
        <>
          <SearchBar value={filters.query} onChange={(value) => setFilter('query', value)} />

          <CategoryChips
            categories={CATEGORIES}
            value={filters.category}
            onChange={(value) => setFilter('category', value)}
            counts={categoryCounts}
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
        <>
          <ProjectGrid projects={pageItems} loading={loading} />
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      ) : hasProjects ? (
        <EmptyState
          icon={FiSearch}
          title="No projects match your filters"
          description="Try a different search term, or clear the filters to see everything again."
          action={{ label: 'Clear filters', onClick: resetFilters }}
        />
      ) : (
        <EmptyState
          icon={FiFolder}
          title="No projects yet"
          description="Upload your first project explanation video to start building your library."
          action={{ label: 'Upload a video', to: '/upload', icon: FiPlus }}
        />
      )}
    </PageTransition>
  );
}
