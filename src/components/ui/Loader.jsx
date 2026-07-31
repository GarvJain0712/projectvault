import { cx } from '@/utils/helpers';

/** Spinner shown while something short is in flight. */
export function Spinner({ className }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cx(
        'inline-block animate-spin rounded-full border-2 border-accent/25 border-t-accent',
        'h-5 w-5',
        className
      )}
    />
  );
}

/** Grey shimmer block — the building block of every skeleton below. */
export function Skeleton({ className }) {
  return (
    <div
      className={cx(
        'relative overflow-hidden rounded-lg bg-ink/[0.06] dark:bg-white/[0.06]',
        className
      )}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/25 to-transparent dark:via-white/10" />
    </div>
  );
}

/** Placeholder that mirrors the real ProjectCard layout. */
export function ProjectCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <Skeleton className="aspect-video rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-5 w-16 rounded-md" />
          <Skeleton className="h-5 w-20 rounded-md" />
          <Skeleton className="h-5 w-14 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function ProjectGridSkeleton({ count = 6 }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <ProjectCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function StatsSkeleton({ count = 4 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="card space-y-3 p-5">
          <Skeleton className="h-9 w-9 rounded-xl" />
          <Skeleton className="h-7 w-20" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>
  );
}

export default Spinner;
