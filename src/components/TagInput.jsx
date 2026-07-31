import { useState } from 'react';
import { FiX } from 'react-icons/fi';

/**
 * Chip-style input for technologies / tags / features.
 * Enter or comma commits the current value; Backspace on an empty input
 * removes the last chip.
 */
export default function TagInput({ value = [], onChange, placeholder = 'Type and press Enter' }) {
  const [draft, setDraft] = useState('');

  const commit = () => {
    const item = draft.trim().replace(/,$/, '');
    if (!item) return;
    if (!value.includes(item)) onChange([...value, item]);
    setDraft('');
  };

  const remove = (item) => onChange(value.filter((entry) => entry !== item));

  return (
    <div className="flex min-h-[46px] flex-wrap items-center gap-1.5 rounded-xl border border-line bg-surface px-2.5 py-2 transition focus-within:border-accent">
      {value.map((item) => (
        <span
          key={item}
          className="inline-flex items-center gap-1 rounded-md bg-accent/10 py-1 pl-2 pr-1 text-[12px] font-medium text-accent"
        >
          {item}
          <button
            type="button"
            onClick={() => remove(item)}
            aria-label={`Remove ${item}`}
            className="rounded p-0.5 transition hover:bg-accent/20"
          >
            <FiX className="text-[13px]" />
          </button>
        </span>
      ))}

      <input
        type="text"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ',') {
            event.preventDefault();
            commit();
          }
          if (event.key === 'Backspace' && !draft && value.length) {
            onChange(value.slice(0, -1));
          }
        }}
        placeholder={value.length === 0 ? placeholder : ''}
        className="min-w-[8rem] flex-1 bg-transparent px-1 py-1 text-sm text-ink outline-none placeholder:text-muted/70"
      />
    </div>
  );
}
