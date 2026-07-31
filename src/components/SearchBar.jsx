import { FiSearch, FiX } from 'react-icons/fi';
import { cx } from '@/utils/helpers';

/** Controlled search input with a clear button. */
export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search projects, technologies, tags…',
  className,
  autoFocus = false,
}) {
  return (
    <div className={cx('relative', className)}>
      <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
      <input
        type="search"
        value={value}
        autoFocus={autoFocus}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label="Search projects"
        className="input pl-10 pr-10 [&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted transition hover:bg-ink/5 hover:text-ink"
        >
          <FiX />
        </button>
      ) : null}
    </div>
  );
}
