import React from 'react'
import { AbsoluteFill, interpolate, OffthreadVideo, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { loadFont } from '@remotion/google-fonts/Lobster'
import { withScriptFallback } from '../lib/fonts'
import { captionAnchorStyle } from '../lib/caption-layout'
import type { Transcript } from '../types'

const { fontFamily: LOBSTER } = loadFont('normal', { weights: ['400'], subsets: ['latin'] })

export interface RetroScriptProps {
  transcript: Transcript; videoSrc: string; activeColor?: string; textColor?: string; fontFamily?: string; fontSizeMultiplier?: number; posX?: number; posY?: number
}

/** A layered sign-painting treatment using a bold connected display script. */
export const RetroScript: React.FC<RetroScriptProps> = ({ transcript, videoSrc, activeColor = '#FF9A3E', textColor = '#FFE08A', fontFamily = LOBSTER, fontSizeMultiplier = 1, posX, posY }) => {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()
  const time = frame / fps
  const segment = transcript.segments.find((s) => time >= s.start && time < s.end)
  const active = segment?.words.findIndex((word) => time >= word.start && time < word.end) ?? -1
  const words = segment?.words.slice(0, 4) ?? []
  const fontSize = Math.round((height > width ? width / 11 : width / 19) * fontSizeMultiplier)
  const reveal = segment ? interpolate(frame - Math.floor(segment.start * fps), [0, 7], [0, 1], { extrapolateRight: 'clamp' }) : 0

  return <AbsoluteFill>
    {videoSrc && <OffthreadVideo src={videoSrc} crossOrigin="anonymous" pauseWhenBuffering style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
    {segment && <AbsoluteFill style={{ ...captionAnchorStyle(Math.round(height * 0.14), posX, posY), paddingLeft: width * 0.05, paddingRight: width * 0.05 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.16em', justifyContent: 'center', maxWidth: width * 0.85, opacity: reveal }}>
        {words.map((word, index) => {
          const isActive = index === active
          const pop = isActive ? spring({ frame: Math.max(0, frame - Math.floor(word.start * fps)), fps, config: { damping: 18, stiffness: 180 } }) : 1
          return <span key={`${word.start}-${index}`} style={{ color: activeColor, display: 'inline-block', fontFamily: withScriptFallback(fontFamily), fontSize, fontWeight: 700, lineHeight: 0.95, paintOrder: 'stroke fill', textShadow: `3px 3px 0 #B51D62, 1px 1px 0 ${textColor}, -1px -1px 0 ${textColor}, 0 3px 5px #3A1720`, transform: `scale(${isActive ? 0.96 + pop * 0.04 : 1})` }}>{word.word}</span>
        })}
      </div>
    </AbsoluteFill>}
  </AbsoluteFill>
}
