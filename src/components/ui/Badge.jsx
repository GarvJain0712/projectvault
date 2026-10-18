import { cx } from '@/utils/helpers';

/** Small rounded pill used for categories, technologies, tags and status. */
export default function Badge({ children, className, tone = 'neutral', ...rest }) {
  const tones = {
    neutral: 'bg-surface border border-line text-ink',
    accent: 'bg-accent border border-line text-accent-ink',
    outline: 'border-2 border-line text-ink font-semibold',
  };

  return (
    <span
      className={cx(
        'inline-flex max-w-full items-center gap-1 truncate rounded-md px-2 py-0.5',
        'text-[11px] font-medium leading-5',
        tones[tone] || tones.neutral,
        className
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
