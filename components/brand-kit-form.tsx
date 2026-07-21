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
              'flex items-center justify-center border text-xs text-center px-3 py-6 transition-colors rounded-xl',
              defaultCompositionId === null
                ? 'border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--ink)]'
                : 'border-[var(--hair)] text-[var(--mute)] hover:border-[var(--faint)] hover:text-[var(--ink)]',
            ].join(' ')}
          >
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
                onClick={() => setDefaultCompositionId(s.id)}
                className={[
                  'relative text-left transition-all overflow-hidden rounded-xl',
                  active ? 'ring-2 ring-inset ring-[var(--brand)]' : 'ring-1 ring-inset ring-[var(--hair)] hover:ring-[var(--faint)]',
                ].join(' ')}
              >
                <CaptionStylePreview id={s.id} />
                <div className="px-2.5 py-2 bg-[var(--panel)]">
                  <p className="text-xs text-[var(--ink)] font-medium">{s.label}</p>
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
                'border rounded-lg p-3 text-left transition-all space-y-1',
                fontFamily === f.value ? 'border-[var(--brand)] bg-[var(--brand-soft)]' : 'border-[var(--hair)] hover:border-[var(--faint)]',
              ].join(' ')}
            >
              <p className="text-lg leading-none text-[var(--ink)]" style={{ fontFamily: f.value }}>Aa</p>
              <p className="text-[10px] text-[var(--mute)]">{f.label}</p>
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
