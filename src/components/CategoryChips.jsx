import { motion } from 'framer-motion';
import { cx } from '@/utils/helpers';

/**
 * Horizontally scrollable category filter.
 * `counts` is an optional { [category]: number } map.
 */
export default function CategoryChips({ categories, value, onChange, counts = {} }) {
  const options = ['All', ...categories];

  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 no-scrollbar">
      {options.map((category) => {
        const isActive = value === category;
        const count = category === 'All' ? undefined : counts[category];

        return (
          <button
            key={category}
            type="button"
            onClick={() => onChange(category)}
            className={cx(
              'relative shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors',
              isActive ? 'text-accent-ink' : 'text-muted hover:bg-ink/5 hover:text-ink'
            )}
          >
            {isActive ? (
              <motion.span
                layoutId="category-chip"
                className="absolute inset-0 -z-10 rounded-full bg-accent"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            ) : null}
            {category}
            {count ? <span className="ml-1.5 opacity-70 tabular-nums">{count}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
