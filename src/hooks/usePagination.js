import { useEffect, useMemo, useState } from 'react';
import { ITEMS_PER_PAGE } from '@/data/constants';

/** Slices a list into pages and keeps the page index in range. */
export default function usePagination(items, perPage = ITEMS_PER_PAGE) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / perPage));

  // If filters shrink the list, snap back to a valid page.
  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const pageItems = useMemo(
    () => items.slice((page - 1) * perPage, page * perPage),
    [items, page, perPage]
  );

  return { page, setPage, totalPages, pageItems };
}
