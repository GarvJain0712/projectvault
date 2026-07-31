import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FiAlertCircle, FiAlertTriangle, FiCheckCircle, FiInfo, FiX } from 'react-icons/fi';

const TOAST_STYLES = {
  success: { icon: FiCheckCircle, ring: 'text-emerald-500' },
  error: { icon: FiAlertCircle, ring: 'text-rose-500' },
  warning: { icon: FiAlertTriangle, ring: 'text-amber-500' },
  info: { icon: FiInfo, ring: 'text-accent' },
};

/** Bottom-right notification stack. Rendered once by <ToastProvider>. */
export default function ToastStack({ toasts, onDismiss }) {
  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[200] flex flex-col items-center gap-2.5 p-4 sm:inset-x-auto sm:right-0 sm:items-end sm:p-6">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const { icon: Icon, ring } = TOAST_STYLES[toast.type] || TOAST_STYLES.info;
          return (
            <motion.div
              key={toast.id}
              layout
              role="status"
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              className="glass pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl px-4 py-3 shadow-lift"
            >
              <Icon className={`mt-0.5 shrink-0 text-lg ${ring}`} aria-hidden />
              <p className="flex-1 text-sm leading-relaxed text-ink">{toast.message}</p>
              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                aria-label="Dismiss notification"
                className="-mr-1 rounded-md p-1 text-muted transition hover:bg-ink/5 hover:text-ink"
              >
                <FiX />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>,
    document.body
  );
}
