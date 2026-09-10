import React from 'react'
import { AbsoluteFill, OffthreadVideo, useCurrentFrame, useVideoConfig } from 'remotion'
import { withScriptFallback } from '../lib/fonts'
import { captionAnchorStyle } from '../lib/caption-layout'
import { getActiveCaptionWords } from '../lib/active-caption-words'
import type { Transcript } from '../types'

export interface GlitchProps {
  transcript: Transcript
  videoSrc: string
  activeColor?: string
  textColor?: string
  fontFamily?: string
  fontSizeMultiplier?: number
  posX?: number
  posY?: number
}

export const Glitch: React.FC<GlitchProps> = ({
  transcript,
  videoSrc,
  activeColor = '#F8FAFC',
  textColor = '#FFFFFF',
  fontFamily = 'Anton, Impact, sans-serif',
  fontSizeMultiplier = 1,
  posX,
  posY,
}) => {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()
  const currentTime = frame / fps
  const fontSize = Math.round(((height > width ? width / 17 : width / 27)) * fontSizeMultiplier)
  const { currentSegment, visibleWords } = getActiveCaptionWords(transcript, currentTime)

  return (
    <AbsoluteFill>
      {videoSrc && <OffthreadVideo src={videoSrc} crossOrigin="anonymous" pauseWhenBuffering style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
      {currentSegment && (
        <AbsoluteFill style={{ ...captionAnchorStyle(Math.round(height * 0.1), posX, posY), padding: `0 ${Math.round(width * 0.06)}px` }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35em', justifyContent: 'center', maxWidth: Math.round(width * 0.88) }}>
            {visibleWords.map((word, index) => {
              const isCurrent = currentTime >= word.start && currentTime < word.end
              const jitter = isCurrent ? Math.round(Math.sin((frame + index * 17) * 4.1) * 3) : 0
              return <span key={index} style={{ display: 'inline-block', fontSize, fontWeight: 900, fontFamily: withScriptFallback(fontFamily), color: isCurrent ? activeColor : textColor, textTransform: 'uppercase', textShadow: isCurrent ? `${jitter + 3}px 0 #00E5FF, ${jitter - 3}px 0 #FF2851, 0 3px 8px rgba(0,0,0,0.95)` : '0 3px 8px rgba(0,0,0,0.95)', transform: isCurrent ? `translate(${jitter}px, ${jitter % 2}px) skewX(${jitter}deg)` : 'none', lineHeight: 1.1 }}>{word.word}</span>
            })}
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  )
}
