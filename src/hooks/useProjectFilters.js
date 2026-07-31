import { useMemo, useState } from 'react';
import useDebounce from './useDebounce';

export const INITIAL_FILTERS = {
  query: '',
  category: 'All',
  difficulty: 'All',
  status: 'All',
  technology: 'All',
  sort: 'latest',
};

/**
 * Central search / filter / sort logic, shared by All Projects, Favorites
 * and Watch Later so the behaviour is identical everywhere.
 */
export default function useProjectFilters(projects) {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const debouncedQuery = useDebounce(filters.query, 250);

  const setFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }));
  const resetFilters = () => setFilters(INITIAL_FILTERS);

  /** Every technology present in the data, for the technology dropdown. */
  const technologyOptions = useMemo(() => {
    const set = new Set();
    projects.forEach((project) => (project.technologies || []).forEach((tech) => set.add(tech)));
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [projects]);

  const filtered = useMemo(() => {
    const query = debouncedQuery.trim().toLowerCase();

    const matches = projects.filter((project) => {
      if (filters.category !== 'All' && project.category !== filters.category) return false;
      if (filters.difficulty !== 'All' && project.difficulty !== filters.difficulty) return false;
      if (filters.status !== 'All' && project.status !== filters.status) return false;
      if (
        filters.technology !== 'All' &&
        !(project.technologies || []).includes(filters.technology)
      ) {
        return false;
      }
      if (!query) return true;

      // Search across title, descriptions, category, technologies and tags.
      const haystack = [
        project.title,
        project.shortDescription,
        project.longDescription,
        project.category,
        ...(project.technologies || []),
        ...(project.tags || []),
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });

    const sorters = {
      latest: (a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt),
      oldest: (a, b) => new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt),
      alphabetical: (a, b) => a.title.localeCompare(b.title),
      mostViewed: (a, b) => (b.views || 0) - (a.views || 0),
    };

    // Pinned projects always float to the top, then the chosen sort applies.
    return [...matches].sort(
      (a, b) => Number(b.pinned) - Number(a.pinned) || sorters[filters.sort](a, b)
    );
  }, [projects, filters, debouncedQuery]);

  const activeFilterCount = [
    filters.category !== 'All',
    filters.difficulty !== 'All',
    filters.status !== 'All',
    filters.technology !== 'All',
  ].filter(Boolean).length;

  return { filters, setFilter, resetFilters, filtered, technologyOptions, activeFilterCount };
}
