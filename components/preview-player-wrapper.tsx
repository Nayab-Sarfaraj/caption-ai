'use client'

import dynamic from 'next/dynamic'

export const PreviewPlayer = dynamic(
  () => import('@/components/preview-player').then((m) => ({ default: m.PreviewPlayer })),
  { ssr: false, loading: () => <div className="skeleton aspect-video rounded-2xl border border-[var(--hair)]" /> }
)
