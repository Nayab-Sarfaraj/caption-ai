import React from 'react'
import { AbsoluteFill, useCurrentFrame, useVideoConfig, OffthreadVideo, interpolate } from 'remotion'
import { withScriptFallback } from '../lib/fonts'
import type { Transcript } from '../types'
import { captionAnchorStyle } from '../lib/caption-layout'

export interface MemeProps {
  transcript: Transcript
  videoSrc: string
  activeColor?: string // accepted from the shared props but intentionally unused
  textColor?: string
  fontFamily?: string
  fontSizeMultiplier?: number
  posX?: number
  posY?: number
}

// Classic meme caption — white Impact all-caps with a thick black outline, the
// whole phrase at once (no per-word pop). Defaults to the top of the frame via
// its editor preset. activeColor is intentionally ignored to keep the look pure.
export const Meme: React.FC<MemeProps> = ({
  transcript,
  videoSrc,
  textColor = '#FFFFFF',
  fontFamily = 'Impact, "Arial Black", sans-serif',
  fontSizeMultiplier = 1,
  posX,
  posY,
}) => {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()
  const currentTime = frame / fps
  const isPortrait = height > width
  const fontSize = Math.round((isPortrait ? width / 15 : width / 24) * fontSizeMultiplier)
  const paddingBottom = Math.round(height * 0.1)
  const paddingH = Math.round(width * 0.06)
  const maxWidth = Math.round(width * 0.9)
  const strokeWidth = Math.max(3, Math.round(fontSize * 0.06))

  const CHUNK_SIZE = 6
  const currentSegment = transcript.segments.find((s) => currentTime >= s.start && currentTime < s.end)
  const currentWordIdx = currentSegment
    ? currentSegment.words.findIndex((w) => currentTime >= w.start && currentTime < w.end)
    : -1
  const activeIdx =
    currentWordIdx >= 0 ? currentWordIdx
    : currentSegment ? currentSegment.words.reduce((acc, w, i) => (currentTime >= w.start ? i : acc), 0)
    : 0
  const chunkStart = Math.floor(activeIdx / CHUNK_SIZE) * CHUNK_SIZE
  const visibleWords = currentSegment ? currentSegment.words.slice(chunkStart, chunkStart + CHUNK_SIZE) : []
  const text = visibleWords.map((w) => w.word).join(' ')

  return (
    <AbsoluteFill style={{ backgroundColor: 'transparent' }}>
      {videoSrc && (
        <OffthreadVideo src={videoSrc} crossOrigin="anonymous" pauseWhenBuffering style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      )}
      {currentSegment && (
        <AbsoluteFill style={{ ...captionAnchorStyle(paddingBottom, posX, posY), paddingLeft: paddingH, paddingRight: paddingH }}>
          {(() => {
            const elapsed = Math.max(0, frame - Math.floor(currentSegment.start * fps))
            const opacity = interpolate(elapsed, [0, 4], [0, 1], { extrapolateRight: 'clamp' })
            return (
              <div
                style={{
                  fontSize,
                  fontWeight: 400,
                  fontFamily: withScriptFallback(fontFamily),
                  textTransform: 'uppercase',
                  color: textColor,
                  WebkitTextStroke: `${strokeWidth}px #000000`,
                  paintOrder: 'stroke fill',
                  textAlign: 'center',
                  maxWidth,
                  lineHeight: 1.05,
                  letterSpacing: '0.01em',
                  opacity,
                }}
              >
                {text}
              </div>
            )
          })()}
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  )
}
