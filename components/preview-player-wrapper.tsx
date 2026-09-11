'use client'

import dynamic from 'next/dynamic'

function PlayerSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-5 items-start w-full animate-pulse">
      {/* Left: Player skeleton */}
      <div className="relative flex-1 min-w-0 w-full aspect-[9/16] max-h-[75vh] min-h-[320px] rounded-2xl border border-[var(--hair)] bg-black/60 flex flex-col items-center justify-center p-6 space-y-3">
        <div className="w-12 h-12 rounded-full border border-[var(--hair)] bg-[var(--panel)] flex items-center justify-center">
          <div className="w-3.5 h-3.5 rounded-full bg-[var(--mute)]/40" />
        </div>
        <span className="text-xs text-[var(--mute)]">Loading preview…</span>
      </div>

      {/* Right: Sidebar controls skeleton */}
      <div className="hidden lg:flex w-80 shrink-0 flex-col rounded-2xl border border-[var(--hair)] bg-[var(--panel)] p-5 space-y-4">
        <div className="h-4 w-3/4 rounded bg-[var(--hair)]" />
        <div className="h-3 w-1/3 rounded bg-[var(--hair)]" />
        <div className="border-t border-[var(--hair)] my-2" />
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] rounded-xl bg-[var(--panel-2)] border border-[var(--hair)]" />
          ))}
        </div>
        <div className="h-10 w-full rounded-lg bg-[var(--hair)] mt-auto" />
      </div>
    </div>
  )
}

export const PreviewPlayer = dynamic(
  () => import('@/components/preview-player').then((m) => ({ default: m.PreviewPlayer })),
  { ssr: false, loading: () => <PlayerSkeleton /> }
)
