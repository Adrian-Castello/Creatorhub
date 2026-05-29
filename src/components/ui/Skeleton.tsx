export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-black/[0.06] dark:bg-white/[0.06] ${className}`}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="surface rounded-2xl p-4">
      <Skeleton className="h-32 w-full mb-3" />
      <Skeleton className="h-4 w-2/3 mb-2" />
      <Skeleton className="h-3 w-1/3" />
    </div>
  )
}
