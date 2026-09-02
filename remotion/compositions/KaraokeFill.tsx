import React from 'react'
import { AbsoluteFill, interpolate, OffthreadVideo, useCurrentFrame, useVideoConfig } from 'remotion'
import { withScriptFallback } from '../lib/fonts'
import { captionAnchorStyle } from '../lib/caption-layout'
import type { Transcript } from '../types'

export interface KaraokeFillProps {
  transcript: Transcript; videoSrc: string; activeColor?: string; textColor?: string; fontFamily?: string; fontSizeMultiplier?: number; posX?: number; posY?: number
}

/** Fills the active glyph from left to right during its timestamp, without moving the phrase. */
export const KaraokeFill: React.FC<KaraokeFillProps> = ({ transcript, videoSrc, activeColor = '#FFD60A', textColor = '#FFFFFF', fontFamily = 'Montserrat, system-ui, sans-serif', fontSizeMultiplier = 1, posX, posY }) => {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()
  const time = frame / fps
  const segment = transcript.segments.find((s) => time >= s.start && time < s.end)
  const active = segment?.words.findIndex((word) => time >= word.start && time < word.end) ?? -1
  const words = segment?.words.slice(0, 6) ?? []
  const fontSize = Math.round((height > width ? width / 18 : width / 30) * fontSizeMultiplier)
  const stroke = Math.max(2, Math.round(fontSize * 0.035))

  return <AbsoluteFill>
    {videoSrc && <OffthreadVideo src={videoSrc} crossOrigin="anonymous" pauseWhenBuffering style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
    {segment && <AbsoluteFill style={{ ...captionAnchorStyle(Math.round(height * 0.08), posX, posY), paddingLeft: width * 0.05, paddingRight: width * 0.05 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.42em', justifyContent: 'center', maxWidth: width * 0.88 }}>
        {words.map((word, index) => {
          const isActive = index === active
          const durationFrames = Math.max(3, Math.round(Math.max(0.001, word.end - word.start) * fps))
          const progress = isActive ? interpolate(frame - Math.floor(word.start * fps), [0, durationFrames], [0, 100], { extrapolateRight: 'clamp' }) : 0
          return <span key={`${word.start}-${index}`} style={{ backgroundClip: isActive ? 'text' : undefined, backgroundImage: isActive ? `linear-gradient(90deg, ${activeColor} 0%, ${activeColor} ${progress}%, ${textColor} ${progress}%, ${textColor} 100%)` : undefined, color: isActive ? 'transparent' : textColor, display: 'inline-block', fontFamily: withScriptFallback(fontFamily), fontSize, fontWeight: 900, lineHeight: 1.2, paintOrder: 'stroke fill', textShadow: '0 2px 6px rgba(0,0,0,0.9)', WebkitBackgroundClip: isActive ? 'text' : undefined, WebkitTextFillColor: isActive ? 'transparent' : undefined, WebkitTextStroke: `${stroke}px #080808` }}>{word.word}</span>
        })}
      </div>
    </AbsoluteFill>}
  </AbsoluteFill>
}
