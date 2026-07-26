'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { CompositionId } from '@/remotion/compositions/CaptionRoot'
import { CaptionStylePreview } from '@/components/caption-style-preview'
import { ColorSwatch } from '@/components/color-swatch'
import { STYLES, FONTS, HIGHLIGHT_PRESETS, TEXT_PRESETS } from '@/src/helpers/style-options'

const DEFAULTS = {
  fontFamily: FONTS[0].value,
  activeColor: '#FACC15',
  textColor: '#FFFFFF',
  accentColor: '#A3E635',
}

export interface BrandKitFormProps {
  initial: {
    fontFamily: string | null
    activeColor: string | null
    textColor: string | null
    accentColor: string | null
    defaultCompositionId: CompositionId | null
  }
}

export function BrandKitForm({ initial }: BrandKitFormProps) {
  const router = useRouter()
  const [fontFamily, setFontFamily] = useState(initial.fontFamily ?? DEFAULTS.fontFamily)
  const [activeColor, setActiveColor] = useState(initial.activeColor ?? DEFAULTS.activeColor)
  const [textColor, setTextColor] = useState(initial.textColor ?? DEFAULTS.textColor)
  const [accentColor, setAccentColor] = useState(initial.accentColor ?? DEFAULTS.accentColor)
  const [defaultCompositionId, setDefaultCompositionId] = useState<CompositionId | null>(initial.defaultCompositionId)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const save = useCallback(
    async (body: Record<string, string | null>) => {
      setSaving(true)
      setSaved(false)
      setError(null)
      try {
        const res = await fetch('/api/brand-kit', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(typeof data.error === 'string' ? data.error : 'Save failed')
        }
        setSaved(true)
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Save failed')
      } finally {
        setSaving(false)
      }
    },
    [router]
  )

  const handleSave = useCallback(() => {
    save({ fontFamily, activeColor, textColor, accentColor, defaultCompositionId })
  }, [save, fontFamily, activeColor, textColor, accentColor, defaultCompositionId])

  const handleReset = useCallback(() => {
    setFontFamily(DEFAULTS.fontFamily)
    setActiveColor(DEFAULTS.activeColor)
    setTextColor(DEFAULTS.textColor)
    setAccentColor(DEFAULTS.accentColor)
    setDefaultCompositionId(null)
    save({ fontFamily: null, activeColor: null, textColor: null, accentColor: null, defaultCompositionId: null })
  }, [save])

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Default caption style */}
      <section className="space-y-3">
        <p className="text-[11px] tracking-[0.15em] uppercase text-[var(--mute)]">{'// Default Style'}</p>
        <p className="text-xs text-[var(--ink-dim)]">
          Pre-selected every time you export a new video. You can still change it per-export.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setDefaultCompositionId(null)}
            className={[
              'relative flex items-center justify-center text-xs text-center px-3 py-6 transition-all rounded-xl ring-2 ring-inset',
              defaultCompositionId === null
                ? 'ring-[var(--brand)] bg-[var(--brand-soft)] text-[var(--ink)] font-semibold'
                : 'ring-[var(--hair)] text-[var(--mute)] hover:ring-[var(--faint)] hover:text-[var(--ink)]',
            ].join(' ')}
          >
            {defaultCompositionId === null && (
              <span className="absolute top-1.5 right-1.5 flex items-center justify-center w-5 h-5 rounded-full bg-[var(--brand)] text-white shadow">
                <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 10l4 4 8-9" /></svg>
              </span>
            )}
            No default
            <br />
            (Word by Word)
          </button>
          {STYLES.map((s) => {
            const active = defaultCompositionId === s.id
            return (
              <button
                key={s.id}
                type="button"
                aria-pressed={active}
                onClick={() => setDefaultCompositionId(s.id)}
                className={[
                  'relative text-left transition-all overflow-hidden rounded-xl ring-2 ring-inset',
                  active
                    ? 'ring-[var(--brand)] shadow-[0_0_0_3px_var(--brand-soft)]'
                    : 'ring-1 ring-[var(--hair)] hover:ring-[var(--faint)]',
                ].join(' ')}
              >
                <CaptionStylePreview id={s.id} />
                {active && (
                  <span className="absolute top-1.5 right-1.5 z-10 flex items-center justify-center w-5 h-5 rounded-full bg-[var(--brand)] text-white shadow">
                    <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 10l4 4 8-9" /></svg>
                  </span>
                )}
                <div className={['px-2.5 py-2', active ? 'bg-[var(--brand)]' : 'bg-[var(--panel)]'].join(' ')}>
                  <p className={['text-xs font-medium', active ? 'text-white' : 'text-[var(--ink)]'].join(' ')}>{s.label}</p>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      <div className="border-t border-[var(--hair)]" />

      {/* Colors */}
      <section className="space-y-4">
        <p className="text-[11px] tracking-[0.15em] uppercase text-[var(--mute)]">{'// Colors'}</p>
        <ColorSwatch label="Highlight" value={activeColor} onChange={setActiveColor} presets={HIGHLIGHT_PRESETS} />
        <ColorSwatch label="Text" value={textColor} onChange={setTextColor} presets={TEXT_PRESETS} />
        <ColorSwatch label="Accent (Box Highlight only)" value={accentColor} onChange={setAccentColor} presets={HIGHLIGHT_PRESETS} />
      </section>

      <div className="border-t border-[var(--hair)]" />

      {/* Font */}
      <section className="space-y-3">
        <p className="text-[11px] tracking-[0.15em] uppercase text-[var(--mute)]">{'// Font'}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {FONTS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFontFamily(f.value)}
              className={[
                'rounded-lg p-3 text-left transition-all space-y-1 ring-1 ring-inset',
                fontFamily === f.value
                  ? 'ring-2 ring-[var(--brand)] bg-[color-mix(in_srgb,var(--brand)_18%,transparent)]'
                  : 'ring-[var(--hair)] hover:ring-[var(--faint)]',
              ].join(' ')}
            >
              <p className="text-lg leading-none text-[var(--ink)]" style={{ fontFamily: f.value }}>Aa</p>
              <p className={['text-[10px]', fontFamily === f.value ? 'text-[var(--ink)] font-semibold' : 'text-[var(--mute)]'].join(' ')}>{f.label}</p>
            </button>
          ))}
        </div>
      </section>

      <div className="border-t border-[var(--hair)]" />

      {error && <p className="text-xs text-[var(--brand)]">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-[var(--brand)] text-white text-sm font-bold rounded-lg px-5 py-2.5 hover:brightness-[1.08] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving…' : saved ? 'Saved' : 'Save brand kit'}
        </button>
        <button
          type="button"
          onClick={handleReset}
          disabled={saving}
          className="text-sm text-[var(--ink-dim)] hover:text-[var(--ink)] transition-colors disabled:opacity-50"
        >
          Reset to defaults
        </button>
      </div>
    </div>
  )
}
