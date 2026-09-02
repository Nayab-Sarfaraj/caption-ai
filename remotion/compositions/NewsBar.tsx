import React from 'react'
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { WordByWord } from './WordByWord'
import { withScriptFallback } from '../lib/fonts'
import type { Transcript } from '../types'

export interface NewsBarProps {
  transcript: Transcript
  videoSrc: string
  activeColor?: string
  textColor?: string
  fontFamily?: string
  fontSizeMultiplier?: number
  posX?: number
  posY?: number
  newsHeadline?: string
  newsCategory?: string
}

export const NewsBar: React.FC<NewsBarProps> = ({
  transcript,
  videoSrc,
  activeColor = '#DC2626',
  textColor = '#FFFFFF',
  fontFamily = 'Montserrat, system-ui, sans-serif',
  fontSizeMultiplier = 1,
  posX,
  posY,
  newsHeadline = 'Your headline goes here',
  newsCategory = 'LATEST UPDATE',
}) => {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()
  const enter = spring({ frame, fps, config: { damping: 18, stiffness: 160, mass: 0.8 } })
  const translateX = interpolate(enter, [0, 1], [-width, 0])
  const barHeight = Math.round(height * (height > width ? 0.13 : 0.16))
  const categorySize = Math.round((height > width ? width / 31 : width / 48) * fontSizeMultiplier)
  const headlineSize = Math.round((height > width ? width / 24 : width / 36) * fontSizeMultiplier)

  return (
    <AbsoluteFill>
      <WordByWord
        transcript={transcript}
        videoSrc={videoSrc}
        activeColor={activeColor}
        textColor={textColor}
        fontFamily={fontFamily}
        fontSizeMultiplier={fontSizeMultiplier}
        posX={posX}
        posY={posY ?? 62}
      />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: Math.round(height * 0.055), height: barHeight, display: 'flex', transform: `translateX(${translateX}px)`, boxShadow: '0 8px 24px rgba(0,0,0,0.45)' }}>
        <div style={{ width: '29%', minWidth: Math.round(width * 0.24), backgroundColor: activeColor, color: '#FFFFFF', display: 'flex', alignItems: 'center', padding: `0 ${Math.round(width * 0.035)}px`, fontFamily: withScriptFallback(fontFamily), fontWeight: 900, fontSize: categorySize, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{newsCategory}</div>
        <div style={{ flex: 1, backgroundColor: 'rgba(15,23,42,0.96)', color: textColor, display: 'flex', alignItems: 'center', padding: `0 ${Math.round(width * 0.035)}px`, fontFamily: withScriptFallback(fontFamily), fontWeight: 800, fontSize: headlineSize, lineHeight: 1.05 }}>{newsHeadline}</div>
      </div>
    </AbsoluteFill>
  )
}
