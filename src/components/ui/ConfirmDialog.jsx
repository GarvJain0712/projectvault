import { FiAlertTriangle } from 'react-icons/fi';
import Modal from './Modal';
import Button from './Button';

/** Yes/no confirmation, used before destructive actions. */
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  destructive = true,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      hideClose
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? 'danger' : 'primary'}
            size="sm"
            onClick={() => {
              onConfirm?.();
              onClose?.();
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-4 py-1">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${
            destructive ? 'bg-rose-500/10 text-rose-500' : 'bg-accent/10 text-accent'
          }`}
        >
          <FiAlertTriangle aria-hidden />
        </div>
        <div>
          <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted">{message}</p>
        </div>
      </div>
    </Modal>
  );
}
