import { motion } from 'framer-motion';
import { FiInbox } from 'react-icons/fi';
import Button from './Button';

/**
 * Friendly placeholder for "nothing here yet" situations.
 * `action` = { label, to, onClick, icon }
 */
export default function EmptyState({
  icon: Icon = FiInbox,
  title = 'Nothing here yet',
  description,
  action,
  secondaryAction,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-surface/50 px-6 py-16 text-center"
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-2xl text-accent">
        <Icon aria-hidden />
      </div>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      {description ? (
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted">{description}</p>
      ) : null}

      {(action || secondaryAction) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {action ? (
            <Button to={action.to} onClick={action.onClick} icon={action.icon}>
              {action.label}
            </Button>
          ) : null}
          {secondaryAction ? (
            <Button
              variant="secondary"
              to={secondaryAction.to}
              onClick={secondaryAction.onClick}
              icon={secondaryAction.icon}
            >
              {secondaryAction.label}
            </Button>
          ) : null}
        </div>
      )}
    </motion.div>
  );
}
