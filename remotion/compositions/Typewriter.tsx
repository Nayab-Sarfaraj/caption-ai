import React from 'react'
import { AbsoluteFill, useCurrentFrame, useVideoConfig, OffthreadVideo } from 'remotion'
import { withScriptFallback } from '../lib/fonts'
import type { Transcript } from '../types'
import { captionAnchorStyle } from '../lib/caption-layout'

export interface TypewriterProps {
  transcript: Transcript
  videoSrc: string
  activeColor?: string
  textColor?: string
  fontFamily?: string
  fontSizeMultiplier?: number
  posX?: number
  posY?: number
}

// Characters type in as they're spoken, with a blinking block cursor. Calm and
// recognizable — good for storytelling / faceless narration.
export const Typewriter: React.FC<TypewriterProps> = ({
  transcript,
  videoSrc,
  activeColor = '#FACC15',
  textColor = '#FFFFFF',
  fontFamily = '"Courier New", Courier, monospace',
  fontSizeMultiplier = 1,
  posX,
  posY,
}) => {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()
  const currentTime = frame / fps
  const isPortrait = height > width
  const fontSize = Math.round((isPortrait ? width / 20 : width / 32) * fontSizeMultiplier)
  const paddingBottom = Math.round(height * 0.1)
  const paddingH = Math.round(width * 0.07)
  const maxWidth = Math.round(width * 0.86)

  const currentSegment = transcript.segments.find(
    (s) => currentTime >= s.start && currentTime < s.end
  )

  // Reveal word-by-word (each word appears fully at its start time) — reads as
  // a typewriter without mangling words mid-letter, and stays synced to speech.
  let revealed = ''
  if (currentSegment) {
    for (const w of currentSegment.words) {
      if (currentTime >= w.start) revealed += (revealed ? ' ' : '') + w.word
      else break
    }
  }

  // Block cursor blinks ~2.5x/sec.
  const cursorOn = Math.floor(frame / (fps * 0.4)) % 2 === 0

  return (
    <AbsoluteFill style={{ backgroundColor: 'transparent' }}>
      {videoSrc && (
        <OffthreadVideo src={videoSrc} crossOrigin="anonymous" pauseWhenBuffering style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      )}
      {currentSegment && (
        <AbsoluteFill style={{ ...captionAnchorStyle(paddingBottom, posX, posY), paddingLeft: paddingH, paddingRight: paddingH }}>
          <div
            style={{
              fontSize,
              fontWeight: 700,
              fontFamily: withScriptFallback(fontFamily),
              color: textColor,
              textAlign: 'center',
              maxWidth,
              lineHeight: 1.3,
              textShadow: '0 2px 10px rgba(0,0,0,0.9)',
            }}
          >
            {revealed}
            <span style={{ color: activeColor, opacity: cursorOn ? 1 : 0, marginLeft: '0.05em' }}>▋</span>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  )
}
