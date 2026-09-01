import React from 'react'
import { AbsoluteFill, OffthreadVideo, interpolate, useCurrentFrame, useVideoConfig } from 'remotion'
import { loadFont } from '@remotion/google-fonts/Caveat'
import { withScriptFallback } from '../lib/fonts'
import { captionAnchorStyle } from '../lib/caption-layout'
import { getActiveCaptionWords } from '../lib/active-caption-words'
import type { Transcript } from '../types'

const { fontFamily: CAVEAT } = loadFont('normal', { weights: ['700'], subsets: ['latin'] })

export interface HandwrittenProps {
  transcript: Transcript
  videoSrc: string
  activeColor?: string
  textColor?: string
  fontFamily?: string
  fontSizeMultiplier?: number
  posX?: number
  posY?: number
}

export const Handwritten: React.FC<HandwrittenProps> = ({
  transcript,
  videoSrc,
  activeColor = '#FACC15',
  textColor = '#FFFFFF',
  fontFamily = 'Inter, system-ui, sans-serif',
  fontSizeMultiplier = 1,
  posX,
  posY,
}) => {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()
  const currentTime = frame / fps
  const fontSize = Math.round(((height > width ? width / 18 : width / 29)) * fontSizeMultiplier)
  const { currentSegment, visibleWords } = getActiveCaptionWords(transcript, currentTime)

  return (
    <AbsoluteFill>
      {videoSrc && <OffthreadVideo src={videoSrc} crossOrigin="anonymous" pauseWhenBuffering style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
      {currentSegment && (
        <AbsoluteFill style={{ ...captionAnchorStyle(Math.round(height * 0.1), posX, posY), padding: `0 ${Math.round(width * 0.06)}px` }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4em', justifyContent: 'center', maxWidth: Math.round(width * 0.88) }}>
            {visibleWords.map((word, index) => {
              const isCurrent = currentTime >= word.start && currentTime < word.end
              const elapsed = Math.max(0, frame - Math.floor(word.start * fps))
              const underline = isCurrent ? interpolate(elapsed, [0, 7], [0, 100], { extrapolateRight: 'clamp' }) : 0
              return <span key={index} style={{ display: 'inline-block', position: 'relative', fontSize: isCurrent ? Math.round(fontSize * 1.22) : fontSize, fontWeight: isCurrent ? 700 : 700, fontFamily: isCurrent ? withScriptFallback(CAVEAT) : withScriptFallback(fontFamily), fontStyle: isCurrent ? 'italic' : 'normal', color: isCurrent ? activeColor : textColor, textShadow: '0 2px 10px rgba(0,0,0,0.85)', transform: isCurrent ? 'rotate(-2deg)' : 'none', lineHeight: 1.15 }}>
                {word.word}
                {isCurrent && <span style={{ position: 'absolute', left: 0, bottom: '-0.1em', width: `${underline}%`, height: Math.max(2, Math.round(fontSize * 0.045)), backgroundColor: activeColor, borderRadius: 999, transform: 'rotate(-2deg)' }} />}
              </span>
            })}
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  )
}
