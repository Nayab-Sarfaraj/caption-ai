import React from 'react'
import { AbsoluteFill, useCurrentFrame, useVideoConfig, OffthreadVideo, interpolate } from 'remotion'
import { withScriptFallback } from '../lib/fonts'
import type { Transcript } from '../types'
import { captionAnchorStyle } from '../lib/caption-layout'

export interface UnderlineProps {
  transcript: Transcript
  videoSrc: string
  activeColor?: string
  textColor?: string
  fontFamily?: string
  fontSizeMultiplier?: number
  posX?: number
  posY?: number
}

// A colored underline sweeps left→right under the active word. Clean, editorial,
// good for talking-head / educational content.
export const Underline: React.FC<UnderlineProps> = ({
  transcript,
  videoSrc,
  activeColor = '#38BDF8',
  textColor = '#FFFFFF',
  fontFamily = 'Montserrat, system-ui, sans-serif',
  fontSizeMultiplier = 1,
  posX,
  posY,
}) => {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()
  const currentTime = frame / fps
  const isPortrait = height > width
  const fontSize = Math.round((isPortrait ? width / 18 : width / 28) * fontSizeMultiplier)
  const paddingBottom = Math.round(height * 0.1)
  const paddingH = Math.round(width * 0.06)
  const maxWidth = Math.round(width * 0.88)

  const CHUNK_SIZE = 5
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
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35em', justifyContent: 'center', maxWidth }}>
            {visibleWords.map((word, i) => {
              const isCurrent = currentTime >= word.start && currentTime < word.end
              const elapsed = Math.max(0, frame - Math.floor(word.start * fps))
              const grow = interpolate(elapsed, [0, 6], [0, 100], { extrapolateRight: 'clamp' })
              return (
                <span
                  key={i}
                  style={{
                    position: 'relative',
                    fontSize,
                    fontWeight: 700,
                    fontFamily: withScriptFallback(fontFamily),
                    color: isCurrent ? activeColor : textColor,
                    textShadow: '0 2px 8px rgba(0,0,0,0.85)',
                    lineHeight: 1.4,
                    display: 'inline-block',
                    paddingBottom: '0.14em',
                  }}
                >
                  {word.word}
                  {isCurrent && (
                    <span
                      style={{
                        position: 'absolute',
                        left: 0,
                        bottom: 0,
                        height: Math.max(3, Math.round(fontSize * 0.08)),
                        width: `${grow}%`,
                        backgroundColor: activeColor,
                        borderRadius: 999,
                        boxShadow: `0 0 10px ${activeColor}80`,
                      }}
                    />
                  )}
                </span>
              )
            })}
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  )
}
