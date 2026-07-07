import React from 'react'
import { AbsoluteFill, useCurrentFrame, useVideoConfig, Video, spring, interpolate } from 'remotion'
import { loadFont } from '@remotion/google-fonts/Bangers'
import type { Transcript } from '../types'

const { fontFamily: BANGERS } = loadFont()

export interface HypeProps {
  transcript: Transcript
  videoSrc: string
  activeColor?: string
  textColor?: string
  fontFamily?: string
  fontSizeMultiplier?: number
}

// "MrBeast style": punchy scale-overshoot bounce per word, thick black stroke,
// glowing color on the keyword currently being spoken.
export const Hype: React.FC<HypeProps> = ({
  transcript,
  videoSrc,
  activeColor = '#22C55E',
  textColor = '#FFFFFF',
  fontFamily = BANGERS,
  fontSizeMultiplier = 1,
}) => {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()
  const currentTime = frame / fps
  const isPortrait = height > width
  const fontSize = Math.round((isPortrait ? width / 15 : width / 24) * fontSizeMultiplier)
  const paddingBottom = Math.round(height * 0.1)
  const paddingH = Math.round(width * 0.05)
  const maxWidth = Math.round(width * 0.9)
  const strokeWidth = Math.max(2, Math.round(fontSize * 0.06))

  const CHUNK_SIZE = 4

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
  const visibleWords = currentSegment
    ? currentSegment.words.slice(chunkStart, chunkStart + CHUNK_SIZE)
    : []

  return (
    <AbsoluteFill>
      {videoSrc && (
        <Video src={videoSrc} crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      )}
      {currentSegment && (
        <AbsoluteFill
          style={{
            justifyContent: 'flex-end',
            alignItems: 'center',
            paddingBottom,
            paddingLeft: paddingH,
            paddingRight: paddingH,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.55em',
              justifyContent: 'center',
              maxWidth,
            }}
          >
            {visibleWords.map((word, i) => {
              const isCurrent = currentTime >= word.start && currentTime < word.end
              const wordFrameStart = Math.max(0, Math.floor(word.start * fps))
              const elapsed = Math.max(0, frame - wordFrameStart)

              const bounce = spring({
                frame: elapsed,
                fps,
                config: { damping: 9, stiffness: 260, mass: 0.7 },
              })
              const scale = isCurrent ? 0.6 + bounce * 0.55 : 1

              const opacity = interpolate(elapsed, [0, 4], [0, 1], {
                extrapolateRight: 'clamp',
              })

              return (
                <span
                  key={i}
                  style={{
                    fontSize,
                    fontWeight: 400,
                    fontFamily,
                    textTransform: 'uppercase',
                    color: isCurrent ? activeColor : textColor,
                    WebkitTextStroke: `${strokeWidth}px #000000`,
                    paintOrder: 'stroke fill',
                    textShadow: isCurrent
                      ? `0 0 30px ${activeColor}, 0 4px 12px rgba(0,0,0,0.9)`
                      : '0 4px 12px rgba(0,0,0,0.9)',
                    display: 'inline-block',
                    transform: `scale(${scale})`,
                    transformOrigin: 'center bottom',
                    opacity,
                    lineHeight: 1.15,
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
