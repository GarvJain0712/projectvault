import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { cx } from '@/utils/helpers';

/** Builds [1, '…', 4, 5, 6, '…', 12] style page lists. */
function buildPageList(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = new Set([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);

  const output = [];
  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) output.push('…');
    output.push(page);
  });
  return output;
}

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const go = (next) => {
    onChange(Math.min(totalPages, Math.max(1, next)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const buttonBase =
    'inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2.5 text-sm font-medium transition';

  return (
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-1.5">
      <button
        type="button"
        onClick={() => go(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
        className={cx(buttonBase, 'text-muted hover:bg-ink/5 hover:text-ink disabled:opacity-40')}
      >
        <FiChevronLeft />
      </button>

      {buildPageList(page, totalPages).map((item, index) =>
        item === '…' ? (
          <span key={`gap-${index}`} className="px-1 text-sm text-muted">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => go(item)}
            aria-current={item === page ? 'page' : undefined}
            className={cx(
              buttonBase,
              item === page
                ? 'bg-accent text-accent-ink shadow-soft'
                : 'text-muted hover:bg-ink/5 hover:text-ink'
            )}
          >
            {item}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => go(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
        className={cx(buttonBase, 'text-muted hover:bg-ink/5 hover:text-ink disabled:opacity-40')}
      >
        <FiChevronRight />
      </button>
    </nav>
  );
}
