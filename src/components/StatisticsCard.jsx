import { motion } from 'framer-motion';
import { cx } from '@/utils/helpers';

/**
 * Dashboard metric tile.
 * `trend` is optional free text shown under the value, e.g. "3 this month".
 */
export default function StatisticsCard({
  icon: Icon,
  label,
  value,
  trend,
  accent = 'accent',
  index = 0,
}) {
  const accents = {
    accent: 'bg-accent/10 text-accent',
    emerald: 'bg-emerald-500/10 text-emerald-500',
    amber: 'bg-amber-500/10 text-amber-500',
    rose: 'bg-rose-500/10 text-rose-500',
    blue: 'bg-blue-500/10 text-blue-500',
    violet: 'bg-violet-500/10 text-violet-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.06, 0.36) }}
      className="card p-5 transition-shadow hover:shadow-lift"
    >
      <div
        className={cx(
          'mb-4 flex h-9 w-9 items-center justify-center rounded-xl text-[17px]',
          accents[accent] || accents.accent
        )}
      >
        {Icon ? <Icon aria-hidden /> : null}
      </div>
      <p className="text-2xl font-semibold tracking-tight text-ink tabular-nums">{value}</p>
      <p className="mt-1 text-[13px] text-muted">{label}</p>
      {trend ? <p className="mt-2 text-[11.5px] font-medium text-accent">{trend}</p> : null}
    </motion.div>
  );
}
