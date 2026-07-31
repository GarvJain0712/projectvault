import { FiLock } from 'react-icons/fi';
import EmptyState from './ui/EmptyState';

/**
 * Shown in place of the pages that change data (Upload, Edit) when this
 * device has not been unlocked.
 */
export default function LockedNotice({ action = 'change anything' }) {
  return (
    <EmptyState
      icon={FiLock}
      title="This device is locked"
      description={`Unlock with your admin password to ${action}. Use the padlock button in the top bar. Browsing stays available to everyone.`}
      action={{ label: 'Back to projects', to: '/projects' }}
    />
  );
}
