import React from 'react'
import { AbsoluteFill, interpolate, OffthreadVideo, useCurrentFrame, useVideoConfig } from 'remotion'
import { withScriptFallback } from '../lib/fonts'
import { captionAnchorStyle } from '../lib/caption-layout'
import type { Transcript } from '../types'

export interface FocusCardProps {
  transcript: Transcript; videoSrc: string; activeColor?: string; textColor?: string; fontFamily?: string; fontSizeMultiplier?: number; posX?: number; posY?: number
}

/** A stable phrase-level card: its footprint changes only when the segment changes. */
export const FocusCard: React.FC<FocusCardProps> = ({ transcript, videoSrc, activeColor = '#FACC15', textColor = '#FFFFFF', fontFamily = 'Montserrat, system-ui, sans-serif', fontSizeMultiplier = 1, posX, posY }) => {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()
  const time = frame / fps
  const segment = transcript.segments.find((s) => time >= s.start && time < s.end)
  const active = segment?.words.findIndex((word) => time >= word.start && time < word.end) ?? -1
  const words = segment?.words.slice(0, 5) ?? []
  const fontSize = Math.round((height > width ? width / 19 : width / 31) * fontSizeMultiplier)
  const enter = segment ? interpolate(frame - Math.floor(segment.start * fps), [0, 6], [0, 1], { extrapolateRight: 'clamp' }) : 0

  return <AbsoluteFill>
    {videoSrc && <OffthreadVideo src={videoSrc} crossOrigin="anonymous" pauseWhenBuffering style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
    {segment && <AbsoluteFill style={{ ...captionAnchorStyle(Math.round(height * 0.12), posX, posY), paddingLeft: width * 0.05, paddingRight: width * 0.05 }}>
      <div style={{ alignItems: 'center', backgroundColor: 'rgba(10,14,22,0.82)', borderRadius: Math.round(fontSize * 0.48), boxShadow: '0 10px 30px rgba(0,0,0,0.45)', display: 'flex', flexWrap: 'wrap', gap: '0.32em', justifyContent: 'center', maxWidth: width * 0.84, opacity: enter, padding: `${Math.round(fontSize * 0.42)}px ${Math.round(fontSize * 0.65)}px`, transform: `translateY(${(1 - enter) * 10}px)` }}>
        {words.map((word, index) => <span key={`${word.start}-${index}`} style={{ color: index === active ? activeColor : textColor, display: 'inline-block', fontFamily: withScriptFallback(fontFamily), fontSize, fontWeight: index === active ? 800 : 700, lineHeight: 1.2, transform: index === active ? 'scale(1.03)' : undefined }}>{word.word}</span>)}
      </div>
    </AbsoluteFill>}
  </AbsoluteFill>
}
