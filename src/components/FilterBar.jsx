import { useState } from 'react';
import { FiGrid, FiList, FiRotateCcw, FiSliders } from 'react-icons/fi';
import { DIFFICULTIES, SORT_OPTIONS, STATUSES } from '@/data/constants';
import { useTheme } from '@/context/ThemeContext';
import { cx } from '@/utils/helpers';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Tooltip from './ui/Tooltip';

/**
 * A single labelled <select>.
 * `max-w` + `truncate` stop a long option (e.g. a verbose technology name)
 * from stretching the whole row — the bug that made this bar look broken.
 */
function Select({ label, value, onChange, options, className, fullWidth = false }) {
  return (
    <label className={cx('flex items-center gap-2 text-[13px] text-muted', fullWidth && 'w-full')}>
      <span className={fullWidth ? 'w-20 shrink-0' : 'hidden lg:inline'}>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        className={cx(
          'h-9 truncate rounded-lg border border-line bg-surface px-2.5 text-[13px] font-medium text-ink',
          'transition hover:border-muted/40 focus:border-accent',
          fullWidth ? 'w-full' : 'max-w-[9rem]',
          className
        )}
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
 * Filter + sort controls.
 *
 * Desktop (md+): everything inline.
 * Mobile: one "Filters" button opens a sheet — four dropdowns squeezed into a
 * phone-width row was unusable.
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
  const [sheetOpen, setSheetOpen] = useState(false);

  const selects = (fullWidth = false) => (
    <>
      <Select
        label="Difficulty"
        value={filters.difficulty}
        onChange={(value) => setFilter('difficulty', value)}
        options={['All', ...DIFFICULTIES]}
        fullWidth={fullWidth}
      />
      <Select
        label="Status"
        value={filters.status}
        onChange={(value) => setFilter('status', value)}
        options={['All', ...STATUSES]}
        fullWidth={fullWidth}
      />
      <Select
        label="Tech"
        value={filters.technology}
        onChange={(value) => setFilter('technology', value)}
        options={['All', ...technologyOptions]}
        fullWidth={fullWidth}
      />
      <Select
        label="Sort"
        value={filters.sort}
        onChange={(value) => setFilter('sort', value)}
        options={SORT_OPTIONS}
        fullWidth={fullWidth}
      />
    </>
  );

  const viewToggle = showViewToggle ? (
    <div className="flex shrink-0 items-center rounded-lg border border-line bg-surface p-0.5">
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
              viewMode === mode ? 'bg-accent/10 text-accent' : 'text-muted hover:text-ink'
            )}
          >
            <Icon />
          </button>
        </Tooltip>
      ))}
    </div>
  ) : null;

  const hasActive = activeFilterCount > 0 || filters.query;

  return (
    <>
      <div className="flex items-center gap-2 rounded-xl border border-line bg-surface/60 p-2 sm:gap-2.5 sm:p-2.5">
        {/* Mobile: one button that opens the sheet */}
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-2 text-[13px] font-medium text-ink transition hover:border-muted/40 md:hidden"
        >
          <FiSliders className="text-accent" aria-hidden />
          Filters
          {activeFilterCount > 0 ? (
            <span className="rounded bg-accent px-1.5 text-[11px] font-semibold text-accent-ink">
              {activeFilterCount}
            </span>
          ) : null}
        </button>

        {/* Desktop: inline controls */}
        <div className="hidden items-center gap-2.5 md:flex">
          <span className="flex items-center gap-1.5 pl-1 text-[13px] font-medium text-muted">
            <FiSliders className="text-accent" aria-hidden />
            {activeFilterCount > 0 ? (
              <span className="rounded-md bg-accent/10 px-1.5 text-[11px] font-semibold text-accent">
                {activeFilterCount}
              </span>
            ) : null}
          </span>
          {selects(false)}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {typeof resultCount === 'number' ? (
            <span className="whitespace-nowrap text-[13px] text-muted">
              {resultCount} result{resultCount === 1 ? '' : 's'}
            </span>
          ) : null}

          {hasActive ? (
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

          {viewToggle}
        </div>
      </div>

      {/* Mobile filter sheet */}
      <Modal
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        size="sm"
        title="Filters"
        description="Narrow down your projects."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={onReset}>
              Reset
            </Button>
            <Button size="sm" onClick={() => setSheetOpen(false)}>
              Show {resultCount ?? ''} result{resultCount === 1 ? '' : 's'}
            </Button>
          </>
        }
      >
        <div className="space-y-3.5 py-1">{selects(true)}</div>
      </Modal>
    </>
  );
}
