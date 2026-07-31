import { cx } from '@/utils/helpers';

/**
 * Label + control + hint/error wrapper.
 * Keeps every form in the app visually identical.
 */
export default function Field({ label, hint, error, required, htmlFor, className, children }) {
  return (
    <div className={cx('w-full', className)}>
      {label ? (
        <label className="label" htmlFor={htmlFor}>
          {label}
          {required ? <span className="ml-0.5 text-rose-500">*</span> : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <p className="mt-1 text-xs text-rose-500">{error}</p>
      ) : hint ? (
        <p className="hint">{hint}</p>
      ) : null}
    </div>
  );
}
