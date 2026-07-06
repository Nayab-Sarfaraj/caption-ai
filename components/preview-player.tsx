'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Player } from '@remotion/player'
import { CaptionRoot } from '@/remotion/compositions/CaptionRoot'
import type { CompositionId } from '@/remotion/compositions/CaptionRoot'
import type { Transcript } from '@/src/types/transcript.types'

const STYLES: { id: CompositionId; label: string; desc: string }[] = [
  { id: 'WordByWord', label: 'Word by Word', desc: 'Active word scales up' },
  { id: 'Karaoke',   label: 'Karaoke',      desc: 'Words shift color' },
  { id: 'Fade',      label: 'Fade',          desc: 'Line fades per segment' },
  { id: 'Spring',    label: 'Spring',        desc: 'Words spring from below' },
]

interface PreviewPlayerProps {
  jobId: string
  videoSrc: string
  transcript: Transcript
  durationInFrames: number
  width?: number
  height?: number
}

export function PreviewPlayer({ jobId, videoSrc, transcript, durationInFrames, width = 1920, height = 1080 }: PreviewPlayerProps) {
  const router = useRouter()
  const [style, setStyle] = useState<CompositionId>('WordByWord')
  const [activeColor, setActiveColor] = useState('#FACC15')
  const [textColor, setTextColor] = useState('#FFFFFF')
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Memoize — Remotion docs warn that non-memoized inputProps cause excessive re-renders
  const inputProps = useMemo(
    () => ({ style, transcript, videoSrc, activeColor, textColor }),
    [style, transcript, videoSrc, activeColor, textColor]
  )

  const handleExport = useCallback(async () => {
    setExporting(true)
    setError(null)
    try {
      const res = await fetch(`/api/jobs/${jobId}/render`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ compositionId: style, activeColor, textColor }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Export failed')
      }
      router.refresh() // server component re-fetches → shows rendering state
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed')
      setExporting(false)
    }
  }, [jobId, style, router])

  return (
    <div className="space-y-4">
      {/* Player */}
      <div className="rounded-xl overflow-hidden border border-white/10 bg-black">
        <Player
          component={CaptionRoot as unknown as React.FC<Record<string, unknown>>}
          inputProps={inputProps as unknown as Record<string, unknown>}
          durationInFrames={durationInFrames}
          compositionWidth={width}
          compositionHeight={height}
          fps={30}
          style={{ width: '100%', aspectRatio: '16/9' }}
          controls
          clickToPlay
          showVolumeControls
        />
      </div>

      {/* Style switcher */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {STYLES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setStyle(s.id)}
            className={[
              'rounded-lg border p-3 text-left transition-all space-y-1',
              style === s.id
                ? 'border-white bg-white/5'
                : 'border-white/10 hover:border-white/20',
            ].join(' ')}
          >
            <p className="text-xs font-medium text-white">{s.label}</p>
            <p className="text-[11px] text-zinc-500 leading-tight">{s.desc}</p>
          </button>
        ))}
      </div>

      {/* Color pickers */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-zinc-500">Colors</span>
        <label className="flex items-center gap-1.5 cursor-pointer group">
          <span
            className="w-5 h-5 rounded-full border border-white/20 group-hover:border-white/40 transition-colors"
            style={{ backgroundColor: activeColor }}
          />
          <span className="text-xs text-zinc-400 group-hover:text-white transition-colors">Highlight</span>
          <input
            type="color"
            value={activeColor}
            onChange={(e) => setActiveColor(e.target.value)}
            className="sr-only"
          />
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer group">
          <span
            className="w-5 h-5 rounded-full border border-white/20 group-hover:border-white/40 transition-colors"
            style={{ backgroundColor: textColor }}
          />
          <span className="text-xs text-zinc-400 group-hover:text-white transition-colors">Text</span>
          <input
            type="color"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
            className="sr-only"
          />
        </label>
      </div>

      {/* Export */}
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="button"
        onClick={handleExport}
        disabled={exporting}
        className="w-full rounded-lg bg-white text-black text-sm font-medium py-2.5 hover:bg-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {exporting ? 'Starting export…' : `Export with ${STYLES.find(s => s.id === style)?.label ?? style}`}
      </button>
    </div>
  )
}
