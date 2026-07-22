import React from 'react'
import { AbsoluteFill, useCurrentFrame, useVideoConfig, OffthreadVideo, spring } from 'remotion'
import { withScriptFallback } from '../lib/fonts'
import type { Transcript } from '../types'
import { captionAnchorStyle } from '../lib/caption-layout'

export interface OutlineProps {
  transcript: Transcript
  videoSrc: string
  activeColor?: string
  textColor?: string
  fontFamily?: string
  fontSizeMultiplier?: number
  posX?: number
  posY?: number
}

// Hollow text — words are outline-only until spoken, then the active word fills
// solid. Minimalist, high-design.
export const Outline: React.FC<OutlineProps> = ({
  transcript,
  videoSrc,
  activeColor = '#FACC15',
  textColor = '#FFFFFF',
  fontFamily = 'Anton, Impact, sans-serif',
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
  const maxWidth = Math.round(width * 0.88)
  const strokeWidth = Math.max(2, Math.round(fontSize * 0.03))

  const CHUNK_SIZE = 4
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

  return (
    <AbsoluteFill style={{ backgroundColor: 'transparent' }}>
      {videoSrc && (
        <OffthreadVideo src={videoSrc} crossOrigin="anonymous" pauseWhenBuffering style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      )}
      {currentSegment && (
        <AbsoluteFill style={{ ...captionAnchorStyle(paddingBottom, posX, posY), paddingLeft: paddingH, paddingRight: paddingH }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4em', justifyContent: 'center', maxWidth }}>
            {visibleWords.map((word, i) => {
              const isCurrent = currentTime >= word.start && currentTime < word.end
              const elapsed = Math.max(0, frame - Math.floor(word.start * fps))
              const pop = isCurrent ? spring({ frame: elapsed, fps, config: { damping: 16, stiffness: 200 } }) : 1
              return (
                <span
                  key={i}
                  style={{
                    fontSize,
                    fontWeight: 400,
                    fontFamily: withScriptFallback(fontFamily),
                    textTransform: 'uppercase',
                    // hollow when not spoken, solid fill when active
                    color: isCurrent ? activeColor : 'transparent',
                    WebkitTextStroke: `${strokeWidth}px ${isCurrent ? activeColor : textColor}`,
                    paintOrder: 'stroke fill',
                    filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.7))',
                    transform: `scale(${0.9 + pop * 0.1})`,
                    transformOrigin: 'center bottom',
                    lineHeight: 1.15,
                    display: 'inline-block',
                  }}
                >
                  {word.word}
                </span>
              )
            })}
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  )
}
