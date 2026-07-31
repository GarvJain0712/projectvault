import { motion } from 'framer-motion';
import { cx } from '@/utils/helpers';

/** Animated horizontal progress bar (project completion, upload progress). */
export default function ProgressBar({ value = 0, className, showLabel = false, label }) {
  const clamped = Math.min(100, Math.max(0, Math.round(value)));

  return (
    <div className={cx('w-full', className)}>
      {(showLabel || label) && (
        <div className="mb-1.5 flex items-center justify-between text-xs text-muted">
          <span>{label || 'Progress'}</span>
          <span className="font-medium text-ink tabular-nums">{clamped}%</span>
        </div>
      )}
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-ink/10 dark:bg-white/10"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <motion.div
          className="h-full rounded-full bg-accent"
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}
