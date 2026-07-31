import { useState } from 'react';
import { FiLock, FiUnlock } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Button from './ui/Button';
import Modal from './ui/Modal';
import Tooltip from './ui/Tooltip';

/**
 * Padlock in the navbar. Locked = view only; unlocked = you can edit.
 * Unlocking asks for the admin password and remembers it on this device.
 */
export default function LockButton() {
  const { canWrite, unlocked, lock, unlock, requiresUnlock } = useAuth();
  const toast = useToast();

  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Local mode has no server to unlock against.
  if (!requiresUnlock) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!password.trim()) return;

    setBusy(true);
    setError('');

    try {
      const ok = await unlock(password);
      if (ok) {
        setOpen(false);
        setPassword('');
        toast.success('Unlocked — you can now add and edit projects');
      } else {
        setError('That password is not correct.');
      }
    } catch (caught) {
      setError(caught?.message || 'Could not reach the server.');
    } finally {
      setBusy(false);
    }
  };

  const handleLock = () => {
    lock();
    toast.info('Locked — this device is now view only');
  };

  return (
    <>
      <Tooltip label={unlocked ? 'Lock editing' : 'Unlock editing'} side="bottom">
        <button
          type="button"
          onClick={unlocked ? handleLock : () => setOpen(true)}
          aria-label={unlocked ? 'Lock editing' : 'Unlock editing'}
          className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
            canWrite
              ? 'text-emerald-500 hover:bg-emerald-500/10'
              : 'text-muted hover:bg-ink/5 hover:text-ink'
          }`}
        >
          {unlocked ? <FiUnlock className="text-[17px]" /> : <FiLock className="text-[17px]" />}
        </button>
      </Tooltip>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        size="sm"
        title="Unlock editing"
        description="Enter your admin password to add, edit or delete projects on this device."
      >
        <form onSubmit={handleSubmit} className="space-y-3 py-1">
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setError('');
            }}
            placeholder="Admin password"
            autoComplete="current-password"
            className="input"
          />

          {error ? <p className="text-xs text-rose-500">{error}</p> : null}

          <p className="text-xs leading-relaxed text-muted">
            This device will stay unlocked until you lock it again. Anyone without the password can
            still browse, but cannot change anything.
          </p>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={!password.trim() || busy}>
              {busy ? 'Checking…' : 'Unlock'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
