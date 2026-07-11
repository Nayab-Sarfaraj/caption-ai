'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Player } from '@remotion/player'
import { CaptionRoot } from '@/remotion/compositions/CaptionRoot'
import type { CompositionId } from '@/remotion/compositions/CaptionRoot'
import { CaptionStylePreview } from '@/components/caption-style-preview'
import { ColorSwatch } from '@/components/color-swatch'
import { STYLES, CATEGORY_ORDER, FONTS, FONTS_INITIAL, HIGHLIGHT_PRESETS, TEXT_PRESETS } from '@/src/helpers/style-options'
import type { Transcript } from '@/src/types/transcript.types'

interface PreviewPlayerProps {
  jobId: string
  videoSrc: string
  transcript: Transcript
  durationInFrames: number
  width?: number
  height?: number
  filename: string
  statusLabel: string
  statusColor: string
  transcriptSource?: string
  createdAt?: string
}

interface StyleSettings {
  activeColor: string
  textColor: string
  accentColor: string
  fontFamily: string
  fontSizeMultiplier: number
}

type SettingsMap = Record<CompositionId, StyleSettings>

const DEFAULT: StyleSettings = {
  activeColor: '#FACC15',
  textColor: '#FFFFFF',
  accentColor: '#A3E635',
  fontFamily: FONTS[0].value,
  fontSizeMultiplier: 1.0,
}

const INITIAL_SETTINGS: SettingsMap = {
  WordByWord: { ...DEFAULT },
  Karaoke:    { ...DEFAULT },
  Fade:       { ...DEFAULT },
  Spring:     { ...DEFAULT },
  Hype:       { ...DEFAULT, activeColor: '#22C55E', textColor: '#FFFFFF', fontFamily: 'Bangers, "Comic Sans MS", cursive' },
  Hormozi:    { ...DEFAULT, activeColor: '#F7C204', textColor: '#FFFFFF', fontFamily: 'Anton, Impact, sans-serif' },
  Minimal:    { ...DEFAULT, activeColor: '#FFFFFF', textColor: '#FFFFFF', fontFamily: 'Inter, system-ui, sans-serif' },
  BoxHighlight: { ...DEFAULT, activeColor: '#7C3AED', textColor: '#FFFFFF', accentColor: '#A3E635', fontFamily: 'Montserrat, sans-serif' },
  Comic:      { ...DEFAULT, activeColor: '#38BDF8', textColor: '#FFFFFF', fontFamily: 'Fredoka, sans-serif' },
  Pill:       { ...DEFAULT, activeColor: '#1F2937', textColor: '#FFFFFF', fontFamily: 'Roboto, sans-serif' },
  Script:     { ...DEFAULT, activeColor: '#FBBF24', textColor: '#FFFFFF', fontFamily: 'Inter, system-ui, sans-serif' },
}

export function PreviewPlayer({
  jobId,
  videoSrc,
  transcript,
  durationInFrames,
  width = 1920,
  height = 1080,
  filename,
  statusLabel,
  statusColor,
  transcriptSource,
  createdAt,
}: PreviewPlayerProps) {
  const router = useRouter()
  const [style, setStyle] = useState<CompositionId>('WordByWord')
  const [settings, setSettings] = useState<SettingsMap>(INITIAL_SETTINGS)
  const [view, setView] = useState<'styles' | 'appearance' | 'fonts'>('styles')
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cur = settings[style]

  const update = useCallback(<K extends keyof StyleSettings>(key: K, value: StyleSettings[K]) => {
    setSettings(prev => ({ ...prev, [style]: { ...prev[style], [key]: value } }))
  }, [style])

  const inputProps = useMemo(
    () => ({
      style,
      transcript,
      videoSrc,
      activeColor: cur.activeColor,
      textColor: cur.textColor,
      accentColor: cur.accentColor,
      fontFamily: cur.fontFamily,
      fontSizeMultiplier: cur.fontSizeMultiplier,
    }),
    [style, transcript, videoSrc, cur]
  )

  const handleExport = useCallback(async () => {
    setExporting(true)
    setError(null)
    try {
      const res = await fetch(`/api/jobs/${jobId}/render`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          compositionId: style,
          activeColor: cur.activeColor,
          textColor: cur.textColor,
          accentColor: cur.accentColor,
          fontFamily: cur.fontFamily,
          fontSizeMultiplier: cur.fontSizeMultiplier,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Export failed')
      }
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed')
      setExporting(false)
    }
  }, [jobId, style, cur, router])

  const aspectRatio = `${width}/${height}`

  return (
    <div className="flex flex-col lg:flex-row gap-5 items-start font-[family-name:var(--font-cc)]">
      {/* Left: player */}
      <div className="flex-1 min-w-0 overflow-hidden border border-[#14120f1f] bg-black">
        <Player
          component={CaptionRoot as unknown as React.FC<Record<string, unknown>>}
          inputProps={inputProps as unknown as Record<string, unknown>}
          durationInFrames={durationInFrames}
          compositionWidth={width}
          compositionHeight={height}
          fps={30}
          style={{ width: '100%', aspectRatio }}
          controls
          clickToPlay
          showVolumeControls
        />
      </div>

      {/* Right: info + controls */}
      <div className="w-full lg:w-80 shrink-0 border border-[#14120f1f] bg-white p-5 space-y-4">
        {/* Job info */}
        <div className="space-y-1.5">
          <h1 className="text-sm font-bold text-[#1a1917] truncate">{filename}</h1>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: statusColor }} />
            <span className="text-sm" style={{ color: statusColor }}>{statusLabel}</span>
          </div>
        </div>

        {transcriptSource && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#a39e96]">Transcript</span>
            <span className="text-[#6b6862] text-xs">
              {transcriptSource === 'user' ? 'Uploaded SRT/VTT' : 'AI · Deepgram'}
            </span>
          </div>
        )}
        {createdAt && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#a39e96]">Created</span>
            <span className="text-[#6b6862] text-xs">{createdAt}</span>
          </div>
        )}

        <div className="border-t border-[#14120f1f]" />

        {view === 'styles' && (
          /* ── Style selection (categorized) ── */
          <>
            <div className="flex items-center justify-between">
              <p className="text-[11px] tracking-[0.15em] uppercase text-[#a39e96]">Caption Style</p>
              <button
                type="button"
                onClick={() => setView('appearance')}
                className="flex items-center gap-1 text-xs text-[#6b6862] hover:text-[#1a1917] transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
                Edit
              </button>
            </div>
            <div className="space-y-4 max-h-[480px] overflow-y-auto pr-0.5">
              {CATEGORY_ORDER.map((cat) => (
                <div key={cat} className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#1a1917]">{cat}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {STYLES.filter((s) => s.category === cat).map((s) => {
                      const active = style === s.id
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setStyle(s.id)}
                          className={[
                            'relative text-left transition-all overflow-hidden rounded-xl',
                            active ? 'ring-2 ring-inset ring-[#c1361f]' : 'ring-1 ring-inset ring-[#14120f1f] hover:ring-[#14120f3d]',
                          ].join(' ')}
                        >
                          <CaptionStylePreview id={s.id} />
                          {active && (
                            <span className="absolute top-1.5 left-1.5 w-4 h-4 rounded-full bg-[#c1361f] flex items-center justify-center">
                              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                            </span>
                          )}
                          <div className="px-2.5 py-2 bg-white">
                            <p className="text-xs text-[#1a1917] font-medium">{s.label}</p>
                            <p className="text-[10px] text-[#a39e96] leading-tight mt-0.5">{s.desc}</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {view === 'appearance' && (
          /* ── Appearance (per-style) ── */
          <>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setView('styles')} className="flex items-center gap-1 text-xs text-[#6b6862] hover:text-[#1a1917] transition-colors">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                Back
              </button>
              <p className="text-[11px] tracking-[0.15em] uppercase text-[#a39e96]">
                {STYLES.find(s => s.id === style)?.label}
              </p>
            </div>

            <ColorSwatch
              label={style === 'BoxHighlight' ? 'Box' : style === 'Pill' ? 'Pill Background' : 'Highlight'}
              value={cur.activeColor}
              onChange={(v) => update('activeColor', v)}
              presets={HIGHLIGHT_PRESETS}
            />
            <ColorSwatch label="Text" value={cur.textColor} onChange={(v) => update('textColor', v)} presets={TEXT_PRESETS} />
            {style === 'BoxHighlight' && (
              <ColorSwatch label="Accent" value={cur.accentColor} onChange={(v) => update('accentColor', v)} presets={HIGHLIGHT_PRESETS} />
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#a39e96]">Font</p>
                <button type="button" onClick={() => setView('fonts')} className="flex items-center gap-0.5 text-[10px] text-[#a39e96] hover:text-[#6b6862] transition-colors">
                  More
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {FONTS.slice(0, FONTS_INITIAL).map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => update('fontFamily', f.value)}
                    className={[
                      'px-2.5 py-1 border text-xs transition-all',
                      cur.fontFamily === f.value ? 'border-[#c1361f] bg-[#c1361f08] text-[#1a1917]' : 'border-[#14120f1f] text-[#6b6862] hover:border-[#14120f3d] hover:text-[#1a1917]',
                    ].join(' ')}
                    style={{ fontFamily: f.value }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#a39e96]">Size</p>
                <p className="text-xs text-[#6b6862] tabular-nums">{cur.fontSizeMultiplier.toFixed(2)}×</p>
              </div>
              <input type="range" min={0.5} max={2.0} step={0.05} value={cur.fontSizeMultiplier}
                onChange={(e) => update('fontSizeMultiplier', parseFloat(e.target.value))}
                className="w-full accent-[#c1361f] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#a39e96]"><span>Small</span><span>Large</span></div>
            </div>
          </>
        )}

        {view === 'fonts' && (
          /* ── Font browser (full panel) ── */
          <>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setView('appearance')} className="flex items-center gap-1 text-xs text-[#6b6862] hover:text-[#1a1917] transition-colors">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                Back
              </button>
              <p className="text-[11px] tracking-[0.15em] uppercase text-[#a39e96]">Font Family</p>
            </div>
            <div className="overflow-y-auto max-h-64 pr-0.5">
              <div className="grid grid-cols-2 gap-2">
                {FONTS.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => update('fontFamily', f.value)}
                    className={[
                      'border p-3 text-left transition-all space-y-1',
                      cur.fontFamily === f.value ? 'border-[#c1361f] bg-[#c1361f08]' : 'border-[#14120f1f] hover:border-[#14120f3d]',
                    ].join(' ')}
                  >
                    <p className="text-lg leading-none text-[#1a1917]" style={{ fontFamily: f.value }}>Aa</p>
                    <p className="text-[10px] text-[#a39e96]">{f.label}</p>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="border-t border-[#14120f1f]" />

        {error && <p className="text-xs text-[#c1361f]">{error}</p>}
        <button
          type="button"
          onClick={handleExport}
          disabled={exporting}
          className="w-full bg-[#c1361f] text-white text-sm font-bold py-2.5 hover:brightness-[1.08] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {exporting ? 'Starting export…' : `Export · ${STYLES.find((s) => s.id === style)?.label ?? style}`}
        </button>
      </div>
    </div>
  )
}
