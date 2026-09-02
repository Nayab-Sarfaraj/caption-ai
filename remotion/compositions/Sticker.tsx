import React from 'react'
import { AbsoluteFill, OffthreadVideo, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { withScriptFallback } from '../lib/fonts'
import { captionAnchorStyle } from '../lib/caption-layout'
import { getActiveCaptionWords } from '../lib/active-caption-words'
import type { Transcript } from '../types'

export interface StickerProps {
  transcript: Transcript
  videoSrc: string
  activeColor?: string
  textColor?: string
  fontFamily?: string
  fontSizeMultiplier?: number
  posX?: number
  posY?: number
}

export const Sticker: React.FC<StickerProps> = ({
  transcript,
  videoSrc,
  activeColor = '#22C55E',
  textColor = '#FFFFFF',
  fontFamily = 'Fredoka, system-ui, sans-serif',
  fontSizeMultiplier = 1,
  posX,
  posY,
}) => {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()
  const currentTime = frame / fps
  const fontSize = Math.round(((height > width ? width / 18 : width / 28)) * fontSizeMultiplier)
  const { currentSegment, visibleWords } = getActiveCaptionWords(transcript, currentTime)

  return (
    <AbsoluteFill>
      {videoSrc && <OffthreadVideo src={videoSrc} crossOrigin="anonymous" pauseWhenBuffering style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
      {currentSegment && (
        <AbsoluteFill style={{ ...captionAnchorStyle(Math.round(height * 0.1), posX, posY), padding: `0 ${Math.round(width * 0.06)}px` }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.38em', justifyContent: 'center', maxWidth: Math.round(width * 0.88) }}>
            {visibleWords.map((word, index) => {
              const isCurrent = currentTime >= word.start && currentTime < word.end
              const elapsed = Math.max(0, frame - Math.floor(word.start * fps))
              const pop = isCurrent ? spring({ frame: elapsed, fps, config: { damping: 13, stiffness: 240, mass: 0.65 } }) : 1
              return <span key={index} style={{ display: 'inline-block', fontSize, fontWeight: 900, fontFamily: withScriptFallback(fontFamily), color: isCurrent ? '#111827' : textColor, textShadow: isCurrent ? '0 3px 0 rgba(0,0,0,0.24)' : '0 2px 10px rgba(0,0,0,0.85)', backgroundColor: isCurrent ? activeColor : 'transparent', border: isCurrent ? `${Math.max(2, Math.round(fontSize * 0.04))}px solid #FFFFFF` : 'none', borderRadius: isCurrent ? Math.round(fontSize * 0.18) : 0, padding: isCurrent ? '0.04em 0.2em' : 0, transform: isCurrent ? `rotate(${index % 2 ? 3 : -3}deg) scale(${0.8 + pop * 0.2})` : 'none', lineHeight: 1.2 }}>{word.word}</span>
            })}
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  )
}
