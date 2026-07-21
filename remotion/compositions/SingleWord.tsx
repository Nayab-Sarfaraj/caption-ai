import React from 'react'
import { AbsoluteFill, useCurrentFrame, useVideoConfig, OffthreadVideo, spring } from 'remotion'
import { withScriptFallback } from '../lib/fonts'
import type { Transcript } from '../types'
import { captionAnchorStyle } from '../lib/caption-layout'

export interface SingleWordProps {
  transcript: Transcript
  videoSrc: string
  activeColor?: string
  textColor?: string
  fontFamily?: string
  fontSizeMultiplier?: number
  posX?: number
  posY?: number
}

// One giant word on screen at a time, punch-scaling in as it's spoken. The
// dominant TikTok/Reels "big word" look — maximal impact, minimal reading.
export const SingleWord: React.FC<SingleWordProps> = ({
  transcript,
  videoSrc,
  activeColor = '#FACC15',
  textColor = '#FFFFFF',
  fontFamily = 'system-ui, -apple-system, sans-serif',
  fontSizeMultiplier = 1,
  posX,
  posY,
}) => {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()
  const currentTime = frame / fps
  const isPortrait = height > width
  const fontSize = Math.round((isPortrait ? width / 7 : width / 12) * fontSizeMultiplier)
  const paddingBottom = Math.round(height * 0.1)
  const strokeWidth = Math.max(3, Math.round(fontSize * 0.04))

  const words = transcript.words
  // Most recent word that has started — persists through gaps between words so
  // it doesn't flicker to blank, but clears shortly after the last word ends.
  let idx = -1
  for (let i = 0; i < words.length; i++) {
    if (currentTime >= words[i].start) idx = i
    else break
  }
  const lastEnd = words.length ? words[words.length - 1].end : 0
  const active = idx >= 0 && currentTime < lastEnd + 0.4 ? words[idx] : null

  return (
    <AbsoluteFill style={{ backgroundColor: 'transparent' }}>
      {videoSrc && (
        <OffthreadVideo src={videoSrc} crossOrigin="anonymous" pauseWhenBuffering style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      )}
      {active && (
        <AbsoluteFill style={{ ...captionAnchorStyle(paddingBottom, posX, posY) }}>
          {(() => {
            const elapsed = Math.max(0, frame - Math.floor(active.start * fps))
            const pop = spring({ frame: elapsed, fps, config: { damping: 12, stiffness: 240, mass: 0.7 } })
            return (
              <span
                style={{
                  fontSize,
                  fontWeight: 900,
                  fontFamily: withScriptFallback(fontFamily),
                  textTransform: 'uppercase',
                  color: activeColor,
                  WebkitTextStroke: `${strokeWidth}px #000000`,
                  paintOrder: 'stroke fill',
                  textShadow: `0 0 40px ${activeColor}70, 0 6px 20px rgba(0,0,0,0.9)`,
                  transform: `scale(${0.7 + pop * 0.3})`,
                  transformOrigin: 'center',
                  lineHeight: 1,
                  display: 'inline-block',
                }}
              >
                {active.word}
              </span>
            )
          })()}
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  )
}
