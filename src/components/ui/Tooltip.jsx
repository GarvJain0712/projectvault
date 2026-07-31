/**
 * Minimal CSS-only tooltip. Wrap any element:
 *   <Tooltip label="Add to favourites"><button .../></Tooltip>
 */
export default function Tooltip({ label, children, side = 'top' }) {
  const position = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }[side];

  return (
    <span className="group/tt relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute z-50 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-[11px] font-medium text-bg opacity-0 shadow-lift transition-opacity duration-150 group-hover/tt:opacity-100 ${position}`}
      >
        {label}
      </span>
    </span>
  );
}
