import { cx } from '@/utils/helpers';

/** Small rounded pill used for categories, technologies, tags and status. */
export default function Badge({ children, className, tone = 'neutral', ...rest }) {
  const tones = {
    neutral: 'bg-ink/5 text-muted dark:bg-white/5',
    accent: 'bg-accent/10 text-accent',
    outline: 'border border-line text-muted',
  };

  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium leading-5',
        tones[tone] || tones.neutral,
        className
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
