'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { STYLE_PREVIEW_META } from '@/components/caption-style-preview'
import type { CompositionId } from '@/remotion/compositions/CaptionRoot'
import s from './hero-caption-demo.module.css'

interface StyleVideoPreviewProps {
  id: CompositionId
  label?: string
}

type Word = { t: string; kw?: boolean }

const SAMPLE_PHRASES: Word[][] = [
  [
    { t: 'THIS' },
    { t: 'IS' },
    { t: 'HOW' },
    { t: 'YOU' },
    { t: 'STOP', kw: true },
    { t: 'THE' },
    { t: 'SCROLL', kw: true },
  ],
  [
    { t: 'BOOST' },
    { t: 'YOUR' },
    { t: 'REELS', kw: true },
    { t: 'AND' },
    { t: 'SHORTS', kw: true },
  ],
  [
    { t: 'FAST' },
    { t: 'WORD' },
    { t: 'LEVEL', kw: true },
    { t: 'AI' },
    { t: 'CAPTIONS', kw: true },
  ],
]

export function StyleVideoPreview({ id, label }: StyleVideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [t, setT] = useState(7)
  const [phraseIdx, setPhraseIdx] = useState(0)

  const meta = STYLE_PREVIEW_META[id as CompositionId] ?? STYLE_PREVIEW_META.WordByWord
  const displayLabel = label ?? id
  const kwColor = meta.keywordColor ?? meta.baseColor

  useEffect(() => {
    const clock = setInterval(() => setT((v) => (v + 1) % 12), 900)
    const sceneTimer = setInterval(() => {
      setPhraseIdx((prev) => (prev + 1) % SAMPLE_PHRASES.length)
    }, 3200)

    return () => {
      clearInterval(clock)
      clearInterval(sceneTimer)
    }
  }, [])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {})
        else v.pause()
      },
      { threshold: 0.25 }
    )
    io.observe(v)
    return () => io.disconnect()
  }, [])

  const tc = `00:00:${t < 10 ? `0${t}` : t}`
  const words = SAMPLE_PHRASES[phraseIdx]

  // Render variant styles
  const isStroke = meta.mechanic === 'stroke'
  const isBox = meta.mechanic === 'box'
  const isNeon = meta.mechanic === 'neon'
  const isGradient = meta.mechanic === 'gradient'
  const isHighlighter = meta.mechanic === 'highlighter'
  const isUnderline = meta.mechanic === 'underline'
  const isPill = meta.mechanic === 'pill'
  const isBar = meta.mechanic === 'bar'
  const isScript = meta.mechanic === 'script'

  const textTransform = meta.uppercase
    ? 'uppercase'
    : meta.mechanic === 'lowercase'
      ? 'lowercase'
      : 'none'

  const strokeStyle = isStroke
    ? { WebkitTextStroke: '1.3px #000', paintOrder: 'stroke fill' as const }
    : {}

  return (
    <div className={s.device}>
      <div className={s.clip}>
        <div className={s.frame} />
        <video
          ref={videoRef}
          className={s.video}
          src="/hero-demo.mp4"
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        />
        <div className={s.scrim} aria-hidden="true" />
        <div className={s.chrome}>
          <span className={s.rec}>
            <span className={s.recDot} />
            REC
          </span>
          <span className={s.tc}>{tc}</span>
        </div>
        <span className={s.styleTag}>{displayLabel}</span>

        <div className={s.capWrap}>
          {/* Key remounts per phrase change to trigger wordIn keyframe animation */}
          <div
            key={phraseIdx}
            className={s.cap}
            style={{
              fontFamily: meta.fontFamily,
              textTransform,
              fontSize: isStroke || isBox ? 28 : 25,
              ...strokeStyle,
            }}
          >
            {words.map((w, idx) => {
              const isKw = Boolean(w.kw)
              let customStyle: CSSProperties = {}
              let customClass = isKw ? `${s.w} ${s.kw}` : s.w

              if (isKw && isBox) {
                customStyle = {
                  backgroundColor: meta.boxColor ?? '#7C3AED',
                  color: meta.boxTextColor ?? '#A3E635',
                  padding: '2px 8px',
                  borderRadius: 6,
                  WebkitTextStroke: '0',
                }
              } else if (isKw && isScript) {
                customStyle = {
                  fontFamily: 'var(--font-caveat), cursive',
                  color: meta.keywordColor ?? '#FBBF24',
                  fontStyle: 'italic',
                  fontSize: '1.2em',
                }
              } else if (isKw && isNeon) {
                customStyle = {
                  color: meta.keywordColor ?? '#22D3EE',
                  textShadow: `0 0 8px ${meta.glow}, 0 0 20px ${meta.glow}`,
                }
              } else if (isKw && isGradient) {
                customStyle = {
                  backgroundImage: `linear-gradient(90deg, ${meta.keywordColor}, #F9A8D4)`,
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                  WebkitTextFillColor: 'transparent',
                }
              } else if (isKw && isHighlighter) {
                customStyle = {
                  backgroundColor: meta.keywordColor ?? '#FDE047',
                  color: '#171717',
                  padding: '1px 8px',
                  borderRadius: 4,
                  WebkitTextStroke: '0',
                }
              } else if (isKw && isUnderline) {
                customStyle = {
                  color: meta.keywordColor ?? '#38BDF8',
                  borderBottom: `3.5px solid ${meta.keywordColor ?? '#38BDF8'}`,
                  paddingBottom: 2,
                }
              } else if (isPill) {
                customStyle = {
                  backgroundColor: 'rgba(28,28,26,0.92)',
                  borderRadius: 6,
                  padding: '2px 8px',
                  color: isKw ? (meta.keywordColor ?? '#fff') : '#fff',
                }
              } else if (isBar) {
                customStyle = {
                  backgroundColor: 'rgba(12,12,11,0.85)',
                  padding: '1px 6px',
                  color: isKw ? (meta.keywordColor ?? '#FACC15') : '#fff',
                }
              } else if (isKw) {
                customStyle = {
                  color: kwColor,
                }
              }

              return (
                <span
                  key={idx}
                  className={customClass}
                  style={{
                    animationDelay: `${idx * 0.12}s`,
                    ...customStyle,
                  }}
                >
                  {w.t}
                </span>
              )
            })}
          </div>
        </div>

        <div className={s.progress}>
          <i />
        </div>
      </div>
    </div>
  )
}
