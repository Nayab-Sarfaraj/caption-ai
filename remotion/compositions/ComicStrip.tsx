import React from 'react'
import { AbsoluteFill, OffthreadVideo, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { loadFont } from '@remotion/google-fonts/Bangers'
import { withScriptFallback } from '../lib/fonts'
import { captionAnchorStyle } from '../lib/caption-layout'
import type { Transcript } from '../types'

const { fontFamily: BANGERS } = loadFont('normal', { weights: ['400'], subsets: ['latin'] })

export interface ComicStripProps {
  transcript: Transcript; videoSrc: string; activeColor?: string; textColor?: string; fontFamily?: string; fontSizeMultiplier?: number; posX?: number; posY?: number
}

/** Print-like comic lettering, distinct from the rounded Comic preset. */
export const ComicStrip: React.FC<ComicStripProps> = ({ transcript, videoSrc, activeColor = '#F05268', textColor = '#FFF4C7', fontFamily = BANGERS, fontSizeMultiplier = 1, posX, posY }) => {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()
  const time = frame / fps
  const segment = transcript.segments.find((s) => time >= s.start && time < s.end)
  const active = segment?.words.findIndex((word) => time >= word.start && time < word.end) ?? -1
  const words = segment?.words.slice(0, 5) ?? []
  const fontSize = Math.round((height > width ? width / 12 : width / 22) * fontSizeMultiplier)
  const enter = segment ? spring({ frame: Math.max(0, frame - Math.floor(segment.start * fps)), fps, config: { damping: 16, stiffness: 180, mass: 0.8 } }) : 0
  const stroke = Math.max(3, Math.round(fontSize * 0.055))

  return <AbsoluteFill>
    {videoSrc && <OffthreadVideo src={videoSrc} crossOrigin="anonymous" pauseWhenBuffering style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
    {segment && <AbsoluteFill style={{ ...captionAnchorStyle(Math.round(height * 0.12), posX, posY), paddingLeft: width * 0.05, paddingRight: width * 0.05 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.28em', justifyContent: 'center', maxWidth: width * 0.86, transform: `scale(${0.85 + enter * 0.15})` }}>
        {words.map((word, index) => <span key={`${word.start}-${index}`} style={{ color: index === active ? activeColor : textColor, display: 'inline-block', fontFamily: withScriptFallback(fontFamily), fontSize, fontWeight: 400, letterSpacing: '0.02em', lineHeight: 1.05, paintOrder: 'stroke fill', textShadow: '5px 5px 0 #111111', textTransform: 'uppercase', WebkitTextStroke: `${stroke}px #111111` }}>{word.word}</span>)}
      </div>
    </AbsoluteFill>}
  </AbsoluteFill>
}
