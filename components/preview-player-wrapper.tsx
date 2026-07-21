'use client'

import dynamic from 'next/dynamic'

export const PreviewPlayer = dynamic(
  () => import('@/components/preview-player').then((m) => ({ default: m.PreviewPlayer })),
  { ssr: false, loading: () => <div className="aspect-video bg-black border border-[var(--hair)] animate-pulse" /> }
)
