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
    accent: 'bg-accent border border-ink text-accent-ink shadow-[1px_1px_0px_0px_rgb(var(--color-line))]',
    emerald: 'bg-[#10b981] border border-ink text-white shadow-[1px_1px_0px_0px_rgb(var(--color-line))]',
    amber: 'bg-[#f9c00f] border border-ink text-ink shadow-[1px_1px_0px_0px_rgb(var(--color-line))]',
    rose: 'bg-[#f35c3e] border border-ink text-white shadow-[1px_1px_0px_0px_rgb(var(--color-line))]',
    blue: 'bg-[#2f5cff] border border-ink text-white shadow-[1px_1px_0px_0px_rgb(var(--color-line))]',
    violet: 'bg-violet-500 border border-ink text-white shadow-[1px_1px_0px_0px_rgb(var(--color-line))]',
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
