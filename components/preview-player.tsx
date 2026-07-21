'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Player } from '@remotion/player'
import { CaptionRoot } from '@/remotion/compositions/CaptionRoot'
import type { CompositionId } from '@/remotion/compositions/CaptionRoot'
import { CaptionStylePreview } from '@/components/caption-style-preview'
import { ColorSwatch } from '@/components/color-swatch'
import { PaywallModal } from '@/components/paywall-modal'
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
  isPaid: boolean
  rendersRemaining: number // 0 when isPaid — unlimited stops being a meaningful count
}

interface StyleSettings {
  activeColor: string
  textColor: string
  accentColor: string
  fontFamily: string
  fontSizeMultiplier: number
  posX: number // caption horizontal position, 0–100 % of frame (50 = center)
  posY: number // caption vertical position, 0–100 % of frame (82 = lower third)
}

type SettingsMap = Record<CompositionId, StyleSettings>

const DEFAULT: StyleSettings = {
  activeColor: '#FACC15',
  textColor: '#FFFFFF',
  accentColor: '#A3E635',
  fontFamily: FONTS[0].value,
  fontSizeMultiplier: 1.0,
  posX: 50,
  posY: 82,
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
  SingleWord: { ...DEFAULT, activeColor: '#FACC15', textColor: '#FFFFFF', fontFamily: 'Anton, Impact, sans-serif' },
  Typewriter: { ...DEFAULT, activeColor: '#FACC15', textColor: '#FFFFFF', fontFamily: '"Courier New", Courier, monospace' },
  NeonGlow:   { ...DEFAULT, activeColor: '#22D3EE', textColor: '#FFFFFF', fontFamily: 'Montserrat, sans-serif' },
  CaptionBar: { ...DEFAULT, activeColor: '#FACC15', textColor: '#FFFFFF', fontFamily: 'Montserrat, sans-serif' },
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
  isPaid,
  rendersRemaining,
}: PreviewPlayerProps) {
  const router = useRouter()
  const [style, setStyle] = useState<CompositionId>('WordByWord')
  const [settings, setSettings] = useState<SettingsMap>(INITIAL_SETTINGS)
  const [view, setView] = useState<'styles' | 'appearance' | 'fonts'>('styles')
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPaywall, setShowPaywall] = useState(false)

  const cur = settings[style]
  // Mirrors billing.service.ts's canRender — this render, if triggered now,
  // would come back watermarked (still allowed) or blocked outright.
  const willWatermark = !isPaid && rendersRemaining > 0
  const blocked = !isPaid && rendersRemaining <= 0

  const update = useCallback(<K extends keyof StyleSettings>(key: K, value: StyleSettings[K]) => {
    setSettings(prev => ({ ...prev, [style]: { ...prev[style], [key]: value } }))
  }, [style])

  // Restore the current style's colors, font, size and position to its defaults.
  const resetStyle = useCallback(() => {
    setSettings(prev => ({ ...prev, [style]: { ...INITIAL_SETTINGS[style] } }))
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
      posX: cur.posX,
      posY: cur.posY,
      watermark: willWatermark,
    }),
    [style, transcript, videoSrc, cur, willWatermark]
  )

  const runExport = useCallback(async () => {
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
          posX: cur.posX,
          posY: cur.posY,
        }),
      })
      if (!res.ok) {
        if (res.status === 402) {
          setShowPaywall(true)
          setExporting(false)
          return
        }
        const data = await res.json()
        throw new Error(data.error ?? 'Export failed')
      }
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed')
      setExporting(false)
    }
  }, [jobId, style, cur, router])

  const handleExportClick = useCallback(() => {
    if (!isPaid) {
      setShowPaywall(true)
    } else {
      runExport()
    }
  }, [isPaid, runExport])

  const playerContainerRef = useRef<HTMLDivElement>(null)
  const [playerSize, setPlayerSize] = useState({ width: 0, height: 0 })

  // Remotion's <Player> isn't a native replaced element — it doesn't do the
  // browser's built-in "auto width/height + aspect-ratio + max-*" sizing the
  // way a plain <video> does (that resolved to 0×0 and the player vanished).
  // Compute real pixel dimensions instead: fill the container width, but cap
  // height at 75% of viewport so a portrait (9:16) video doesn't blow up past
  // the screen — recompute on container/window resize.
  useEffect(() => {
    const el = playerContainerRef.current
    if (!el) return
    const ratio = width / height

    const compute = () => {
      const maxHeight = window.innerHeight * 0.75
      const containerWidth = el.clientWidth
      let w = containerWidth
      let h = w / ratio
      if (h > maxHeight) {
        h = maxHeight
        w = h * ratio
      }
      setPlayerSize({ width: w, height: h })
    }

    compute()
    const ro = new ResizeObserver(compute)
    ro.observe(el)
    window.addEventListener('resize', compute)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', compute)
    }
  }, [width, height])

  return (
    <div className="flex flex-col lg:flex-row gap-5 items-start">
      {showPaywall && (
        <PaywallModal
          onClose={() => setShowPaywall(false)}
          onContinueFree={() => { setShowPaywall(false); runExport() }}
        />
      )}

      {/* Left: player */}
      <div ref={playerContainerRef} className="flex-1 min-w-0 overflow-hidden rounded-2xl border border-[var(--hair)] bg-black flex items-center justify-center">
        {playerSize.width > 0 && (
          <Player
            component={CaptionRoot as unknown as React.FC<Record<string, unknown>>}
            inputProps={inputProps as unknown as Record<string, unknown>}
            durationInFrames={durationInFrames}
            compositionWidth={width}
            compositionHeight={height}
            fps={30}
            style={{ width: playerSize.width, height: playerSize.height }}
            controls
            clickToPlay
            showVolumeControls
          />
        )}
      </div>

      {/* Right: info + controls — pinned to the viewport independently of
          the player's height, only the middle (job info + style picker)
          scrolls, Export stays visible without scrolling the page. */}
      <div className="w-full lg:w-80 shrink-0 rounded-2xl border border-[var(--hair)] bg-[var(--panel)] flex flex-col lg:sticky lg:top-6 lg:max-h-[calc(100vh-6rem)]">
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Job info */}
        <div className="space-y-1.5">
          <h1 className="text-sm font-bold text-[var(--ink)] truncate">{filename}</h1>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: statusColor }} />
            <span className="text-sm" style={{ color: statusColor }}>{statusLabel}</span>
          </div>
        </div>

        {transcriptSource && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--mute)]">Transcript</span>
            <span className="text-[var(--ink-dim)] text-xs">
              {transcriptSource === 'user' ? 'Uploaded SRT/VTT' : 'AI · Deepgram'}
            </span>
          </div>
        )}
        {createdAt && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--mute)]">Created</span>
            <span className="text-[var(--ink-dim)] text-xs">{createdAt}</span>
          </div>
        )}

        <div className="border-t border-[var(--hair)]" />

        {view === 'styles' && (
          /* ── Style selection (categorized) ── */
          <>
            <div className="flex items-center justify-between">
              <p className="text-[11px] tracking-[0.15em] uppercase text-[var(--mute)]">Caption Style</p>
              <button
                type="button"
                onClick={() => setView('appearance')}
                className="flex items-center gap-1.5 text-xs font-medium text-[var(--ink)] rounded-lg border border-[var(--hair)] px-2.5 py-1 hover:border-[var(--brand)] hover:text-[var(--brand)] transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
                Edit colors & font
              </button>
            </div>
            <div className="space-y-4 pr-0.5">
              {CATEGORY_ORDER.map((cat) => (
                <div key={cat} className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--ink)]">{cat}</p>
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
                            active ? 'ring-2 ring-inset ring-[var(--brand)]' : 'ring-1 ring-inset ring-[var(--hair)] hover:ring-[var(--faint)]',
                          ].join(' ')}
                        >
                          <CaptionStylePreview id={s.id} />
                          {active && (
                            <span className="absolute top-1.5 left-1.5 w-4 h-4 rounded-full bg-[var(--brand)] flex items-center justify-center">
                              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                            </span>
                          )}
                          <div className="px-2.5 py-2 bg-[var(--panel)]">
                            <p className="text-xs text-[var(--ink)] font-medium">{s.label}</p>
                            <p className="text-[10px] text-[var(--mute)] leading-tight mt-0.5">{s.desc}</p>
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
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setView('styles')} className="flex items-center gap-1 text-xs text-[var(--ink-dim)] hover:text-[var(--ink)] transition-colors">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                  Back
                </button>
                <p className="text-[11px] tracking-[0.15em] uppercase text-[var(--mute)]">
                  {STYLES.find(s => s.id === style)?.label}
                </p>
              </div>
              <button
                type="button"
                onClick={resetStyle}
                className="flex items-center gap-1 text-[10px] text-[var(--mute)] hover:text-[var(--brand)] rounded-md border border-[var(--hair)] px-2 py-1 transition-colors"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>
                Reset
              </button>
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
                <p className="text-xs text-[var(--mute)]">Font</p>
                <button type="button" onClick={() => setView('fonts')} className="flex items-center gap-0.5 text-[10px] text-[var(--mute)] hover:text-[var(--ink-dim)] transition-colors">
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
                      'px-2.5 py-1 rounded-lg border text-xs transition-all',
                      cur.fontFamily === f.value ? 'border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--ink)]' : 'border-[var(--hair)] text-[var(--ink-dim)] hover:border-[var(--faint)] hover:text-[var(--ink)]',
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
                <p className="text-xs text-[var(--mute)]">Size</p>
                <p className="text-xs text-[var(--ink-dim)] tabular-nums">{cur.fontSizeMultiplier.toFixed(2)}×</p>
              </div>
              <input type="range" min={0.5} max={2.0} step={0.05} value={cur.fontSizeMultiplier}
                onChange={(e) => update('fontSizeMultiplier', parseFloat(e.target.value))}
                className="w-full accent-[var(--brand)] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[var(--mute)]"><span>Small</span><span>Large</span></div>
            </div>

            {/* Caption position — % of frame, so preview matches render exactly */}
            <div className="space-y-2.5">
              <p className="text-xs text-[var(--mute)]">Position</p>

              <div className="space-y-1">
                <input type="range" min={0} max={100} step={1} value={cur.posY}
                  onChange={(e) => update('posY', parseInt(e.target.value, 10))}
                  className="w-full accent-[var(--brand)] cursor-pointer"
                  aria-label="Vertical position"
                />
                <div className="flex justify-between text-[10px] text-[var(--mute)]"><span>Top</span><span>Bottom</span></div>
              </div>

              <div className="space-y-1">
                <input type="range" min={0} max={100} step={1} value={cur.posX}
                  onChange={(e) => update('posX', parseInt(e.target.value, 10))}
                  className="w-full accent-[var(--brand)] cursor-pointer"
                  aria-label="Horizontal position"
                />
                <div className="flex justify-between text-[10px] text-[var(--mute)]"><span>Left</span><span>Right</span></div>
              </div>
            </div>
          </>
        )}

        {view === 'fonts' && (
          /* ── Font browser (full panel) ── */
          <>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setView('appearance')} className="flex items-center gap-1 text-xs text-[var(--ink-dim)] hover:text-[var(--ink)] transition-colors">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                Back
              </button>
              <p className="text-[11px] tracking-[0.15em] uppercase text-[var(--mute)]">Font Family</p>
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
                      cur.fontFamily === f.value ? 'border-[var(--brand)] bg-[var(--brand-soft)]' : 'border-[var(--hair)] hover:border-[var(--faint)]',
                    ].join(' ')}
                  >
                    <p className="text-lg leading-none text-[var(--ink)]" style={{ fontFamily: f.value }}>Aa</p>
                    <p className="text-[10px] text-[var(--mute)]">{f.label}</p>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="shrink-0 border-t border-[var(--hair)] p-5 pt-4 space-y-3">
        {!isPaid && (
          <p className="text-xs text-[var(--mute)]">
            {willWatermark
              ? `${rendersRemaining} free render${rendersRemaining === 1 ? '' : 's'} left this month · watermarked`
              : 'Free limit reached this month'}
          </p>
        )}

        {error && <p className="text-xs text-[var(--brand)]">{error}</p>}
        <button
          type="button"
          onClick={handleExportClick}
          disabled={exporting}
          className="w-full rounded-lg bg-[var(--brand)] text-white text-sm font-bold py-2.5 hover:brightness-[1.08] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {exporting
            ? 'Starting export…'
            : blocked
              ? 'Upgrade to export'
              : `Export · ${STYLES.find((s) => s.id === style)?.label ?? style}`}
        </button>
      </div>
      </div>
    </div>
  )
}
