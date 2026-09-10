import { Skeleton } from '@/components/skeleton'

export default function DashboardLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-7 sm:py-10 space-y-6">
      <div>
        <Skeleton className="h-3 w-20 mb-2" />
        <Skeleton className="h-8 w-40 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Upload dropzone skeleton */}
      <div className="rounded-2xl border border-[var(--hair)] bg-[var(--panel)] p-8 flex flex-col items-center justify-center min-h-[200px] space-y-3">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <Skeleton className="h-4 w-44" />
        <Skeleton className="h-3 w-64" />
      </div>

      {/* Style picker preview row skeleton */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="shrink-0 w-[148px] h-[160px] rounded-xl" />
          ))}
        </div>
      </div>

      {/* Recent jobs skeleton */}
      <div className="mt-10 space-y-3 pt-4">
        <div className="flex items-baseline justify-between mb-3">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/3] rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
