import { Skeleton } from '@/components/skeleton'

export default function UsageLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-7 sm:py-10">
      <Skeleton className="h-3 w-16 mb-2" />
      <Skeleton className="h-8 w-24 mb-6" />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border border-[var(--hair)] bg-[var(--panel)] rounded-2xl p-5 space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-16" />
          </div>
        ))}
      </div>

      <div className="mt-4 border border-[var(--hair)] bg-[var(--panel)] rounded-2xl p-5 space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
        <Skeleton className="h-3 w-64" />
        <Skeleton className="h-9 w-36 rounded-lg" />
      </div>
    </div>
  )
}
