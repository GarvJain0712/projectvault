import { Component } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

/**
 * Catches render/lifecycle errors in the routed page so a single broken page
 * shows a readable message instead of silently blanking the whole app.
 * Reset by changing the `resetKey` prop (we pass the pathname).
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidUpdate(previousProps) {
    // Clear the error when the user navigates somewhere else.
    if (this.state.error && previousProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  componentDidCatch(error, info) {
    console.error('[ProjectVault] page crashed:', error, info?.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/[0.04] p-6">
        <h2 className="flex items-center gap-2 text-[15px] font-semibold text-ink">
          <FiAlertTriangle className="text-rose-500" aria-hidden />
          This page failed to render
        </h2>
        <p className="mt-2 text-sm text-muted">
          The rest of the app still works — try navigating somewhere else.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-ink/5 p-3 text-xs text-muted dark:bg-white/5">
          {String(error?.message || error)}
        </pre>
      </div>
    );
  }
}
