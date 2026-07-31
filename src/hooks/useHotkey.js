import { useEffect } from 'react';

/**
 * Register a keyboard shortcut.
 *
 * @param {string}   combo    e.g. "mod+k", "shift+/", "escape"
 * @param {Function} handler  called with the KeyboardEvent
 * @param {boolean}  enabled
 *
 * "mod" means Ctrl on Windows/Linux and Cmd on macOS.
 */
export default function useHotkey(combo, handler, enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined;

    const parts = combo.toLowerCase().split('+');
    const key = parts[parts.length - 1];
    const needsMod = parts.includes('mod');
    const needsShift = parts.includes('shift');
    const needsAlt = parts.includes('alt');

    function onKeyDown(event) {
      const target = event.target;
      const isTyping =
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      // Plain single-letter shortcuts must not fire while typing.
      if (isTyping && !needsMod && key !== 'escape') return;

      const modPressed = event.metaKey || event.ctrlKey;
      if (needsMod !== modPressed) return;
      if (needsShift !== event.shiftKey) return;
      if (needsAlt !== event.altKey) return;
      if (event.key.toLowerCase() !== key) return;

      event.preventDefault();
      handler(event);
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [combo, handler, enabled]);
}
