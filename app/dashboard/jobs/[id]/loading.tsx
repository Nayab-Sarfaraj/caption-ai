import { Skeleton } from '@/components/skeleton'

export default function JobDetailsLoading() {
  return (
    <div className="px-4 sm:px-6 py-6 sm:py-8 space-y-5 min-h-full">
      <Skeleton className="h-4 w-14" />

      <div className="flex flex-col lg:flex-row gap-5 items-start w-full">
        {/* Left: Video preview player skeleton */}
        <div className="relative flex-1 min-w-0 w-full min-h-[360px] sm:min-h-[480px] rounded-2xl border border-[var(--hair)] bg-black/50 flex flex-col items-center justify-center p-6 space-y-3">
          <Skeleton className="w-14 h-14 rounded-full" />
          <Skeleton className="h-3.5 w-36" />
        </div>

        {/* Right: Sidebar controls skeleton */}
        <div className="w-full lg:w-80 shrink-0 rounded-2xl border border-[var(--hair)] bg-[var(--panel)] p-5 space-y-5">
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <div className="flex items-center gap-2">
              <Skeleton className="w-2 h-2 rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>

          <div className="border-t border-[var(--hair)] pt-4 space-y-3">
            <Skeleton className="h-3 w-28" />
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[4/3] rounded-xl" />
              ))}
            </div>
          </div>

          <Skeleton className="h-11 w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}
