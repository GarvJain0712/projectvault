import { useRef, useState } from 'react';
import { FiUploadCloud, FiX } from 'react-icons/fi';
import { cx } from '@/utils/helpers';

/**
 * Click-or-drop file picker.
 * `onFiles` receives a File[]; `preview` is an optional node shown when a
 * file has already been chosen.
 */
export default function FileDropzone({
  accept,
  multiple = false,
  onFiles,
  onClear,
  preview,
  hint,
  icon: Icon = FiUploadCloud,
  label = 'Click to browse or drag a file here',
  className,
}) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (fileList) => {
    const files = Array.from(fileList || []);
    if (files.length) onFiles(multiple ? files : [files[0]]);
  };

  if (preview) {
    return (
      <div className={cx('relative overflow-hidden rounded-xl border border-line', className)}>
        {preview}
        {onClear ? (
          <button
            type="button"
            onClick={onClear}
            aria-label="Remove file"
            className="absolute right-2 top-2 rounded-lg bg-black/60 p-1.5 text-white transition hover:bg-black/80"
          >
            <FiX />
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') inputRef.current?.click();
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        handleFiles(event.dataTransfer.files);
      }}
      className={cx(
        'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition',
        dragging
          ? 'border-accent bg-accent/5'
          : 'border-line bg-surface hover:border-accent/60 hover:bg-accent/[0.03]',
        className
      )}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-xl text-accent">
        <Icon aria-hidden />
      </span>
      <p className="text-[13px] font-medium text-ink">{label}</p>
      {hint ? <p className="text-[11.5px] text-muted">{hint}</p> : null}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(event) => {
          handleFiles(event.target.files);
          event.target.value = '';
        }}
        className="hidden"
      />
    </div>
  );
}
