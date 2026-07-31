import { FiGrid, FiList, FiRotateCcw, FiSliders } from 'react-icons/fi';
import { DIFFICULTIES, SORT_OPTIONS, STATUSES } from '@/data/constants';
import { useTheme } from '@/context/ThemeContext';
import { cx } from '@/utils/helpers';
import Tooltip from './ui/Tooltip';

function Select({ label, value, onChange, options }) {
  return (
    <label className="flex items-center gap-2 text-[13px] text-muted">
      <span className="hidden sm:inline">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        className="h-9 rounded-lg border border-line bg-surface px-2.5 text-[13px] font-medium text-ink transition hover:border-muted/40 focus:border-accent"
      >
        {options.map((option) => (
          <option key={option.value ?? option} value={option.value ?? option}>
            {option.label ?? option}
          </option>
        ))}
      </select>
    </label>
  );
}

/**
 * Difficulty / status / technology / sort controls plus the grid-list switch.
 * Shown above every project listing.
 */
export default function FilterBar({
  filters,
  setFilter,
  onReset,
  technologyOptions,
  activeFilterCount,
  resultCount,
  showViewToggle = true,
}) {
  const { viewMode, setViewMode } = useTheme();

  return (
    <div className="flex flex-wrap items-center gap-2.5 rounded-xl border border-line bg-surface/60 p-2.5">
      <div className="flex items-center gap-1.5 pl-1 pr-1 text-[13px] font-medium text-muted">
        <FiSliders className="text-accent" aria-hidden />
        <span className="hidden sm:inline">Filters</span>
        {activeFilterCount > 0 ? (
          <span className="rounded-md bg-accent/10 px-1.5 text-[11px] font-semibold text-accent">
            {activeFilterCount}
          </span>
        ) : null}
      </div>

      <Select
        label="Difficulty"
        value={filters.difficulty}
        onChange={(value) => setFilter('difficulty', value)}
        options={['All', ...DIFFICULTIES]}
      />

      <Select
        label="Status"
        value={filters.status}
        onChange={(value) => setFilter('status', value)}
        options={['All', ...STATUSES]}
      />

      <Select
        label="Tech"
        value={filters.technology}
        onChange={(value) => setFilter('technology', value)}
        options={['All', ...technologyOptions]}
      />

      <Select
        label="Sort"
        value={filters.sort}
        onChange={(value) => setFilter('sort', value)}
        options={SORT_OPTIONS}
      />

      <div className="ml-auto flex items-center gap-2">
        {typeof resultCount === 'number' ? (
          <span className="hidden text-[13px] text-muted md:inline">
            {resultCount} result{resultCount === 1 ? '' : 's'}
          </span>
        ) : null}

        {activeFilterCount > 0 || filters.query ? (
          <Tooltip label="Reset filters">
            <button
              type="button"
              onClick={onReset}
              aria-label="Reset filters"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition hover:bg-ink/5 hover:text-ink"
            >
              <FiRotateCcw />
            </button>
          </Tooltip>
        ) : null}

        {showViewToggle ? (
          <div className="flex items-center rounded-lg border border-line bg-surface p-0.5">
            {[
              { mode: 'grid', icon: FiGrid, label: 'Grid view' },
              { mode: 'list', icon: FiList, label: 'List view' },
            ].map(({ mode, icon: Icon, label }) => (
              <Tooltip key={mode} label={label}>
                <button
                  type="button"
                  onClick={() => setViewMode(mode)}
                  aria-label={label}
                  aria-pressed={viewMode === mode}
                  className={cx(
                    'flex h-8 w-8 items-center justify-center rounded-md transition',
                    viewMode === mode
                      ? 'bg-accent/10 text-accent'
                      : 'text-muted hover:text-ink'
                  )}
                >
                  <Icon />
                </button>
              </Tooltip>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
