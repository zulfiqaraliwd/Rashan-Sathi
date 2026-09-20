/** Shimmering placeholder block. Size it with className. */
export const Skeleton = ({ className = '' }) => (
  <div
    aria-hidden="true"
    className={`relative overflow-hidden rounded-lg bg-gray-200/70 before:absolute before:inset-0 before:animate-shimmer before:bg-linear-to-r before:from-transparent before:via-white/70 before:to-transparent ${className}`}
  />
);

export const TripCardSkeleton = () => (
  <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-card">
    <div className="flex items-start gap-3">
      <Skeleton className="size-11 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-6 w-14 rounded-full" />
    </div>
    <Skeleton className="mt-5 h-3 w-3/4" />
    <Skeleton className="mt-3 h-10 w-full rounded-xl" />
    <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
      <div className="flex items-center gap-2">
        <Skeleton className="size-8 rounded-full" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-5 w-16" />
    </div>
  </div>
);

export const RowSkeleton = () => (
  <div className="flex items-center gap-4 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-card">
    <Skeleton className="size-11 rounded-xl" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-3 w-1/3" />
    </div>
    <Skeleton className="h-5 w-16" />
  </div>
);

export default Skeleton;
