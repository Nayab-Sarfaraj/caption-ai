'use client'

import { useEffect, useState, type CSSProperties } from 'react'
import { STYLE_PREVIEW_META } from '@/components/caption-style-preview'
import type { CompositionId } from '@/remotion/compositions/CaptionRoot'
import s from './hero-caption-demo.module.css'

type Word = { t: string; kw?: boolean }
type Scene = { id: CompositionId; label: string; variant: string; words: Word[] }

// Each scene maps to a real composition id so the keyword pop color is pulled
// from STYLE_PREVIEW_META — same source the style picker renders from.
const SCENES: Scene[] = [
  { id: 'Hormozi', label: 'Hormozi', variant: s.sHormozi, words: [{ t: 'THIS' }, { t: 'IS' }, { t: 'HOW' }, { t: 'YOU' }, { t: 'STOP', kw: true }, { t: 'THE' }, { t: 'SCROLL' }] },
  { id: 'Hype', label: 'Hype', variant: s.sHype, words: [{ t: 'LET' }, { t: 'THAT' }, { t: 'SINK', kw: true }, { t: 'IN', kw: true }] },
  { id: 'BoxHighlight', label: 'Box Highlight', variant: s.sBox, words: [{ t: 'WATCH' }, { t: 'THIS' }, { t: 'PART', kw: true }, { t: 'CLOSELY' }] },
  { id: 'Minimal', label: 'Minimal', variant: s.sMin, words: [{ t: 'keep' }, { t: 'it' }, { t: 'clean', kw: true }, { t: 'and' }, { t: 'simple' }] },
  { id: 'Karaoke', label: 'Karaoke', variant: s.sKaraoke, words: [{ t: 'Every' }, { t: 'single', kw: true }, { t: 'word', kw: true }, { t: 'lands' }] },
]

const CHIPS = [
  { label: 'Hormozi', color: 'var(--pop-yellow)', pos: s.a },
  { label: 'Box Highlight', color: 'var(--pop-violet)', pos: s.b },
  { label: 'Hype', color: 'var(--pop-green)', pos: s.c },
  { label: 'Minimal', color: '#ffffff', pos: s.d2 },
]

export function HeroCaptionDemo() {
  const [i, setI] = useState(0)
  const [t, setT] = useState(7)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) return
    const scene = setInterval(() => setI((v) => (v + 1) % SCENES.length), 3300)
    const clock = setInterval(() => setT((v) => (v + 1) % 12), 900)
    return () => { clearInterval(scene); clearInterval(clock) }
  }, [])

  const scene = SCENES[i]
  const meta = STYLE_PREVIEW_META[scene.id]
  const kw = meta.keywordColor ?? meta.baseColor
  const tc = `00:00:${t < 10 ? `0${t}` : t}`

  return (
    <div className={s.device}>
      <div className={s.chipCloud} aria-hidden="true">
        {CHIPS.map((c) => (
          <span key={c.label} className={`${s.fchip} ${c.pos}`}>
            <span className={s.fd} style={{ background: c.color }} />
            {c.label}
          </span>
        ))}
      </div>
      <div className={s.clip}>
        <div className={s.frame} />
        <div className={s.chrome}>
          <span className={s.rec}><span className={s.recDot} />REC</span>
          <span className={s.tc}>{tc}</span>
        </div>
        <span className={s.styleTag}>{scene.label}</span>
        <div className={s.capWrap}>
          {/* key remounts the caption so word-in animation replays each cycle */}
          <div key={i} className={`${s.cap} ${scene.variant}`} style={{ '--kw': kw } as CSSProperties}>
            {scene.words.map((w, idx) => (
              <span
                key={idx}
                className={w.kw ? `${s.w} ${s.kw}` : s.w}
                style={{ animationDelay: `${idx * 0.11}s` }}
              >
                {w.t}
              </span>
            ))}
          </div>
        </div>
        <div className={s.progress}><i /></div>
      </div>
    </div>
  )
}
