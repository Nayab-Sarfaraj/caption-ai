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

const FONTS = [
  { label: 'System',       value: 'system-ui, -apple-system, sans-serif' },
  { label: 'Impact',       value: 'Impact, "Arial Black", sans-serif' },
  { label: 'Arial Black',  value: '"Arial Black", "Arial Bold", sans-serif' },
  { label: 'Arial',        value: 'Arial, Helvetica, sans-serif' },
  { label: 'Helvetica',    value: '"Helvetica Neue", Helvetica, Arial, sans-serif' },
  { label: 'Verdana',      value: 'Verdana, Geneva, sans-serif' },
  { label: 'Tahoma',       value: 'Tahoma, Geneva, sans-serif' },
  { label: 'Trebuchet',    value: '"Trebuchet MS", sans-serif' },
  { label: 'Franklin',     value: '"Franklin Gothic Medium", "Arial Narrow", sans-serif' },
  { label: 'Century',      value: '"Century Gothic", "Apple Gothic", sans-serif' },
  { label: 'Candara',      value: 'Candara, Calibri, Optima, sans-serif' },
  { label: 'Gill Sans',    value: '"Gill Sans", "Gill Sans MT", Calibri, sans-serif' },
  { label: 'Optima',       value: 'Optima, Segoe, "Segoe UI", sans-serif' },
  { label: 'Georgia',      value: 'Georgia, serif' },
  { label: 'Palatino',     value: 'Palatino, "Palatino Linotype", serif' },
  { label: 'Times',        value: '"Times New Roman", Times, serif' },
  { label: 'Mono',         value: '"Courier New", Courier, monospace' },
  { label: 'Comic',        value: '"Comic Sans MS", "Chalkboard SE", cursive' },
]
const FONTS_INITIAL = 5


const HIGHLIGHT_PRESETS = ['#FACC15', '#FFFFFF', '#22C55E', '#3B82F6', '#EF4444', '#EC4899', '#F97316', '#A855F7']
const TEXT_PRESETS      = ['#FFFFFF', '#000000', '#FACC15', '#A1A1AA', '#6EE7B7', '#93C5FD']

function ColorSwatch({
  label,
  value,
  onChange,
  presets,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  presets: string[]
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-zinc-500">{label}</p>
      <div className="flex items-center gap-1.5 flex-wrap">
        {presets.map((color) => (
          <button
            key={color}
            type="button"
            title={color}
            onClick={() => onChange(color)}
            className="w-6 h-6 rounded-full transition-transform hover:scale-110 focus:outline-none"
            style={{
              backgroundColor: color,
              border: '2px solid transparent',
              boxShadow:
                value.toLowerCase() === color.toLowerCase()
                  ? '0 0 0 2px #111, 0 0 0 4px #fff'
                  : '0 0 0 1px rgba(255,255,255,0.15)',
            }}
          />
        ))}
        {/* Custom color */}
        <label
          title="Custom color"
          className="w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-110"
          style={{
            background: 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.2)',
          }}
        >
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="sr-only"
          />
        </label>
      </div>
    </div>
  )
}

interface PreviewPlayerProps {
  jobId: string
  videoSrc: string
  transcript: Transcript
  durationInFrames: number
  width?: number
  height?: number
  filename: string
  statusLabel: string
  statusDot: string
  statusText: string
  transcriptSource?: string
  createdAt?: string
}

interface StyleSettings {
  activeColor: string
  textColor: string
  fontFamily: string
  fontSizeMultiplier: number
}

type SettingsMap = Record<CompositionId, StyleSettings>

const DEFAULT: StyleSettings = {
  activeColor: '#FACC15',
  textColor: '#FFFFFF',
  fontFamily: FONTS[0].value,
  fontSizeMultiplier: 1.0,
}

const INITIAL_SETTINGS: SettingsMap = {
  WordByWord: { ...DEFAULT },
  Karaoke:    { ...DEFAULT },
  Fade:       { ...DEFAULT },
  Spring:     { ...DEFAULT },
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
  statusDot,
  statusText,
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
    <div className="flex flex-col lg:flex-row gap-5 items-start">
      {/* Left: player */}
      <div className="flex-1 min-w-0 rounded-xl overflow-hidden border border-white/10 bg-black">
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
      <div className="w-full lg:w-80 shrink-0 rounded-xl border border-white/10 bg-[#111] p-5 space-y-4">
        {/* Job info */}
        <div className="space-y-1.5">
          <h1 className="text-sm font-semibold text-white truncate">{filename}</h1>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full shrink-0 ${statusDot}`} />
            <span className={`text-sm ${statusText}`}>{statusLabel}</span>
          </div>
        </div>

        {transcriptSource && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500">Transcript</span>
            <span className="text-zinc-300 text-xs">
              {transcriptSource === 'user' ? 'Uploaded SRT/VTT' : 'AI · Deepgram'}
            </span>
          </div>
        )}
        {createdAt && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500">Created</span>
            <span className="text-zinc-300 text-xs">{createdAt}</span>
          </div>
        )}

        <div className="border-t border-white/10" />

        {view === 'styles' && (
          /* ── Style selection ── */
          <>
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Caption Style</p>
              <button
                type="button"
                onClick={() => setView('appearance')}
                className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
                Edit
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {STYLES.map((s) => {
                const st = settings[s.id]
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStyle(s.id)}
                    className={[
                      'rounded-lg border p-2.5 text-left transition-all space-y-1',
                      style === s.id ? 'border-white bg-white/5' : 'border-white/10 hover:border-white/20',
                    ].join(' ')}
                  >
                    <p className="text-xs font-medium text-white">{s.label}</p>
                    <p className="text-[10px] text-zinc-500 leading-tight">{s.desc}</p>
                    <div className="flex gap-1 pt-0.5">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: st.activeColor, boxShadow: '0 0 0 1px rgba(255,255,255,0.15)' }} />
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: st.textColor, boxShadow: '0 0 0 1px rgba(255,255,255,0.15)' }} />
                    </div>
                  </button>
                )
              })}
            </div>
          </>
        )}

        {view === 'appearance' && (
          /* ── Appearance (per-style) ── */
          <>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setView('styles')} className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                Back
              </button>
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                {STYLES.find(s => s.id === style)?.label}
              </p>
            </div>

            <ColorSwatch label="Highlight" value={cur.activeColor} onChange={(v) => update('activeColor', v)} presets={HIGHLIGHT_PRESETS} />
            <ColorSwatch label="Text" value={cur.textColor} onChange={(v) => update('textColor', v)} presets={TEXT_PRESETS} />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-zinc-500">Font</p>
                <button type="button" onClick={() => setView('fonts')} className="flex items-center gap-0.5 text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors">
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
                      'px-2.5 py-1 rounded-md border text-xs transition-all',
                      cur.fontFamily === f.value ? 'border-white bg-white/10 text-white' : 'border-white/10 text-zinc-400 hover:border-white/25 hover:text-zinc-200',
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
                <p className="text-xs text-zinc-500">Size</p>
                <p className="text-xs text-zinc-400 font-mono tabular-nums">{cur.fontSizeMultiplier.toFixed(2)}×</p>
              </div>
              <input type="range" min={0.5} max={2.0} step={0.05} value={cur.fontSizeMultiplier}
                onChange={(e) => update('fontSizeMultiplier', parseFloat(e.target.value))}
                className="w-full accent-white cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-600"><span>Small</span><span>Large</span></div>
            </div>
          </>
        )}

        {view === 'fonts' && (
          /* ── Font browser (full panel) ── */
          <>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setView('appearance')} className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                Back
              </button>
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Font Family</p>
            </div>
            <div className="overflow-y-auto max-h-64 pr-0.5">
              <div className="grid grid-cols-2 gap-2">
                {FONTS.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => update('fontFamily', f.value)}
                    className={[
                      'rounded-lg border p-3 text-left transition-all space-y-1',
                      cur.fontFamily === f.value ? 'border-white bg-white/5' : 'border-white/10 hover:border-white/20',
                    ].join(' ')}
                  >
                    <p className="text-lg leading-none text-white" style={{ fontFamily: f.value }}>Aa</p>
                    <p className="text-[10px] text-zinc-500">{f.label}</p>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="border-t border-white/10" />

        {error && <p className="text-xs text-red-400">{error}</p>}
        <button
          type="button"
          onClick={handleExport}
          disabled={exporting}
          className="w-full rounded-lg bg-white text-black text-sm font-medium py-2.5 hover:bg-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {exporting ? 'Starting export…' : `Export · ${STYLES.find((s) => s.id === style)?.label ?? style}`}
        </button>
      </div>
    </div>
  )
}
