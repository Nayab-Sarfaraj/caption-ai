'use client'

import dynamic from 'next/dynamic'

export const PreviewPlayer = dynamic(
  () => import('@/components/preview-player').then((m) => ({ default: m.PreviewPlayer })),
  { ssr: false, loading: () => <div className="aspect-video bg-zinc-900 rounded-xl animate-pulse" /> }
)
