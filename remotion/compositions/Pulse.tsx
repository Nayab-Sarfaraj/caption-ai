import React from 'react'
import { AbsoluteFill, OffthreadVideo, useCurrentFrame, useVideoConfig } from 'remotion'
import { withScriptFallback } from '../lib/fonts'
import { captionAnchorStyle } from '../lib/caption-layout'
import { getActiveCaptionWords } from '../lib/active-caption-words'
import type { Transcript } from '../types'

export interface PulseProps {
  transcript: Transcript
  videoSrc: string
  activeColor?: string
  textColor?: string
  fontFamily?: string
  fontSizeMultiplier?: number
  posX?: number
  posY?: number
}

export const Pulse: React.FC<PulseProps> = ({
  transcript,
  videoSrc,
  activeColor = '#F43F5E',
  textColor = '#FFFFFF',
  fontFamily = 'Montserrat, system-ui, sans-serif',
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
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35em', justifyContent: 'center', maxWidth: Math.round(width * 0.88) }}>
            {visibleWords.map((word, index) => {
              const isCurrent = currentTime >= word.start && currentTime < word.end
              const elapsed = Math.max(0, (frame - Math.floor(word.start * fps)) / fps)
              const pulse = isCurrent ? 1 + Math.sin(elapsed * Math.PI * 5) * 0.09 : 1
              return <span key={index} style={{ display: 'inline-block', fontSize, fontWeight: 900, fontFamily: withScriptFallback(fontFamily), color: isCurrent ? activeColor : textColor, textShadow: '0 2px 10px rgba(0,0,0,0.85)', transform: `scale(${pulse})`, lineHeight: 1.2 }}>{word.word}</span>
            })}
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  )
}
