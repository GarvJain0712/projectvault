import { motion } from 'framer-motion';
import {
  FiActivity,
  FiBookmark,
  FiEdit2,
  FiHeart,
  FiMessageSquare,
  FiPlus,
  FiTrash2,
  FiUploadCloud,
} from 'react-icons/fi';
import { formatRelativeTime } from '@/utils/helpers';

const ICONS = {
  created: { icon: FiPlus, tone: 'text-emerald-500 bg-emerald-500/10' },
  updated: { icon: FiEdit2, tone: 'text-blue-500 bg-blue-500/10' },
  deleted: { icon: FiTrash2, tone: 'text-rose-500 bg-rose-500/10' },
  favorite: { icon: FiHeart, tone: 'text-rose-500 bg-rose-500/10' },
  watchLater: { icon: FiBookmark, tone: 'text-amber-500 bg-amber-500/10' },
  liked: { icon: FiHeart, tone: 'text-rose-500 bg-rose-500/10' },
  commented: { icon: FiMessageSquare, tone: 'text-violet-500 bg-violet-500/10' },
  imported: { icon: FiUploadCloud, tone: 'text-accent bg-accent/10' },
};

/** Vertical "recent activity" feed on the dashboard. */
export default function ActivityTimeline({ items = [], limit = 6 }) {
  const visible = items.slice(0, limit);

  return (
    <section className="card p-5">
      <h2 className="mb-4 flex items-center gap-2 text-[15px] font-semibold text-ink">
        <FiActivity className="text-accent" aria-hidden />
        Recent Activity
      </h2>

      {visible.length === 0 ? (
        <p className="py-6 text-center text-[13px] text-muted">
          Your actions will show up here as you use the vault.
        </p>
      ) : (
        <ol className="relative space-y-4 pl-1">
          {/* The connecting line */}
          <span className="absolute bottom-2 left-[15px] top-2 w-px bg-line" aria-hidden />

          {visible.map((item, index) => {
            const { icon: Icon, tone } = ICONS[item.type] || ICONS.updated;
            return (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.28, delay: Math.min(index * 0.05, 0.3) }}
                className="relative flex gap-3"
              >
                <span
                  className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] ${tone}`}
                >
                  <Icon aria-hidden />
                </span>
                <div className="min-w-0 pt-1">
                  <p className="clamp-2 text-[13px] leading-snug text-ink">{item.message}</p>
                  <p className="mt-0.5 text-[11px] text-muted">{formatRelativeTime(item.at)}</p>
                </div>
              </motion.li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
