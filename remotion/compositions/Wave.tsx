import React from 'react'
import { AbsoluteFill, OffthreadVideo, useCurrentFrame, useVideoConfig } from 'remotion'
import { withScriptFallback } from '../lib/fonts'
import { captionAnchorStyle } from '../lib/caption-layout'
import { getActiveCaptionWords } from '../lib/active-caption-words'
import type { Transcript } from '../types'

export interface WaveProps {
  transcript: Transcript
  videoSrc: string
  activeColor?: string
  textColor?: string
  fontFamily?: string
  fontSizeMultiplier?: number
  posX?: number
  posY?: number
}

export const Wave: React.FC<WaveProps> = ({
  transcript,
  videoSrc,
  activeColor = '#A855F7',
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
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35em', justifyContent: 'center', maxWidth: Math.round(width * 0.88) }}>
            {visibleWords.map((word, wordIndex) => {
              const isCurrent = currentTime >= word.start && currentTime < word.end
              return <span key={wordIndex} style={{ display: 'inline-flex', fontSize, fontWeight: 800, fontFamily: withScriptFallback(fontFamily), color: isCurrent ? activeColor : textColor, textShadow: '0 2px 10px rgba(0,0,0,0.85)', lineHeight: 1.2 }}>
                {Array.from(word.word).map((letter, letterIndex) => {
                  const offset = Math.sin((frame - Math.floor(word.start * fps)) * 0.5 + letterIndex * 0.72) * (isCurrent ? fontSize * 0.12 : fontSize * 0.035)
                  return <span key={`${letter}-${letterIndex}`} style={{ display: 'inline-block', transform: `translateY(${offset}px)` }}>{letter}</span>
                })}
              </span>
            })}
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  )
}
