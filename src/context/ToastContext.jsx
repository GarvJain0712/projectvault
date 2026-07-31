import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { createId } from '@/utils/helpers';
import ToastStack from '@/components/ui/ToastStack';

const ToastContext = createContext(null);

const DEFAULT_DURATION = 3200;

/**
 * Global toast notifications.
 * Usage:  const toast = useToast();  toast.success('Saved!');
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (type, message, duration = DEFAULT_DURATION) => {
      const id = createId('toast');
      setToasts((current) => [...current, { id, type, message }]);
      window.setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({
      push,
      dismiss,
      success: (message) => push('success', message),
      error: (message) => push('error', message, 4500),
      info: (message) => push('info', message),
      warning: (message) => push('warning', message, 4000),
    }),
    [push, dismiss]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside <ToastProvider>.');
  return context;
}
