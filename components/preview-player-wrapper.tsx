'use client'

import dynamic from 'next/dynamic'

export const PreviewPlayer = dynamic(
  () => import('@/components/preview-player').then((m) => ({ default: m.PreviewPlayer })),
  { ssr: false, loading: () => <div className="w-full min-h-[320px] sm:min-h-[420px] rounded-2xl border border-[var(--hair)] bg-black/40 animate-pulse flex items-center justify-center text-xs text-[var(--mute)]">Loading player...</div> }
)
