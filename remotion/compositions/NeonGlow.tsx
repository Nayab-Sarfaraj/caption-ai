import React from 'react'
import { AbsoluteFill, useCurrentFrame, useVideoConfig, OffthreadVideo, interpolate } from 'remotion'
import { withScriptFallback } from '../lib/fonts'
import type { Transcript } from '../types'
import { captionAnchorStyle } from '../lib/caption-layout'

export interface NeonGlowProps {
  transcript: Transcript
  videoSrc: string
  activeColor?: string
  textColor?: string
  fontFamily?: string
  fontSizeMultiplier?: number
  posX?: number
  posY?: number
}

// Clean neon: no box, no heavy stroke — the active word lights up with a soft
// colored glow. Punchy but calmer than Hype's bounce.
export const NeonGlow: React.FC<NeonGlowProps> = ({
  transcript,
  videoSrc,
  activeColor = '#22D3EE',
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
  const fontSize = Math.round((isPortrait ? width / 17 : width / 27) * fontSizeMultiplier)
  const paddingBottom = Math.round(height * 0.1)
  const paddingH = Math.round(width * 0.06)
  const maxWidth = Math.round(width * 0.86)

  const CHUNK_SIZE = 5
  const currentSegment = transcript.segments.find(
    (s) => currentTime >= s.start && currentTime < s.end
  )
  const currentWordIdx = currentSegment
    ? currentSegment.words.findIndex((w) => currentTime >= w.start && currentTime < w.end)
    : -1
  const activeIdx =
    currentWordIdx >= 0
      ? currentWordIdx
      : currentSegment
      ? currentSegment.words.reduce((acc, w, i) => (currentTime >= w.start ? i : acc), 0)
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
              const fade = interpolate(elapsed, [0, 6], [0.35, 1], { extrapolateRight: 'clamp' })
              return (
                <span
                  key={i}
                  style={{
                    fontSize,
                    fontWeight: 800,
                    fontFamily: withScriptFallback(fontFamily),
                    color: isCurrent ? activeColor : textColor,
                    opacity: isCurrent ? 1 : fade,
                    textShadow: isCurrent
                      ? `0 0 6px ${activeColor}, 0 0 18px ${activeColor}, 0 0 40px ${activeColor}cc, 0 2px 8px rgba(0,0,0,0.8)`
                      : '0 2px 10px rgba(0,0,0,0.85)',
                    lineHeight: 1.25,
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
