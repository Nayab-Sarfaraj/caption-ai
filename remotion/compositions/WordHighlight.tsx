import React from 'react'
import { AbsoluteFill, interpolate, OffthreadVideo, useCurrentFrame, useVideoConfig } from 'remotion'
import { withScriptFallback } from '../lib/fonts'
import { captionAnchorStyle } from '../lib/caption-layout'
import type { Transcript } from '../types'

export interface WordHighlightProps {
  transcript: Transcript; videoSrc: string; activeColor?: string; textColor?: string; fontFamily?: string; fontSizeMultiplier?: number; posX?: number; posY?: number
}

/** A deliberately calm, outlined phrase with a readable active-word colour change. */
export const WordHighlight: React.FC<WordHighlightProps> = ({ transcript, videoSrc, activeColor = '#FFD329', textColor = '#FFFFFF', fontFamily = 'Anton, Impact, sans-serif', fontSizeMultiplier = 1, posX, posY }) => {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()
  const time = frame / fps
  const segment = transcript.segments.find((s) => time >= s.start && time < s.end)
  const fontSize = Math.round((height > width ? width / 11.5 : width / 21) * fontSizeMultiplier)
  const active = segment?.words.findIndex((word) => time >= word.start && time < word.end) ?? -1
  const words = segment?.words.slice(0, 6) ?? []
  const reveal = segment ? interpolate(frame - Math.floor(segment.start * fps), [0, 4], [0, 1], { extrapolateRight: 'clamp' }) : 0
  const stroke = Math.max(2, Math.round(fontSize * 0.045))

  return <AbsoluteFill>
    {videoSrc && <OffthreadVideo src={videoSrc} crossOrigin="anonymous" pauseWhenBuffering style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
    {segment && <AbsoluteFill style={{ ...captionAnchorStyle(Math.round(height * 0.1), posX, posY), paddingLeft: width * 0.05, paddingRight: width * 0.05 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.32em', justifyContent: 'center', maxWidth: width * 0.88, opacity: reveal }}>
        {words.map((word, index) => {
          const isActive = index === active
          const pulse = isActive ? interpolate(frame - Math.floor(word.start * fps), [0, 3, 7], [1, 1.05, 1], { extrapolateRight: 'clamp' }) : 1
          return <span key={`${word.start}-${index}`} style={{ color: isActive ? activeColor : textColor, display: 'inline-block', fontFamily: withScriptFallback(fontFamily), fontSize, fontWeight: 900, lineHeight: 1.12, paintOrder: 'stroke fill', textShadow: '3px 3px 1px rgba(0,0,0,0.9)', textTransform: 'uppercase', transform: `scale(${pulse})`, WebkitTextStroke: `${stroke}px #080808` }}>{word.word}</span>
        })}
      </div>
    </AbsoluteFill>}
  </AbsoluteFill>
}
