import { Skeleton } from '@/components/skeleton'

export default function BillingLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-7 sm:py-10 space-y-8">
      <div>
        <Skeleton className="h-3 w-16 mb-2" />
        <Skeleton className="h-8 w-24 mb-1" />
      </div>

      {/* Current plan card skeleton */}
      <div className="max-w-md rounded-2xl border border-[var(--hair)] bg-[var(--panel)] p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="w-2 h-2 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-3.5 w-56" />
        <div className="space-y-2 pt-2 border-t border-[var(--hair)]">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </div>

      {/* Plan selection cards skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-5 w-36" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-[var(--hair)] bg-[var(--panel)] p-5 space-y-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
