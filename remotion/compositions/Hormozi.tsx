import React from 'react'
import { AbsoluteFill, useCurrentFrame, useVideoConfig, Video, spring, interpolate } from 'remotion'
import { loadFont } from '@remotion/google-fonts/Anton'
import type { Transcript } from '../types'

const { fontFamily: ANTON } = loadFont()

export interface HormoziProps {
  transcript: Transcript
  videoSrc: string
  activeColor?: string
  textColor?: string
  fontFamily?: string
  fontSizeMultiplier?: number
}

// "Hormozi style": condensed uppercase, yellow stroke outline, each word pops
// in from below as it's spoken. Restrained motion vs Hype — pop-in only, no bounce.
export const Hormozi: React.FC<HormoziProps> = ({
  transcript,
  videoSrc,
  activeColor = '#F7C204',
  textColor = '#FFFFFF',
  fontFamily = ANTON,
  fontSizeMultiplier = 1,
}) => {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()
  const currentTime = frame / fps
  const isPortrait = height > width
  const fontSize = Math.round((isPortrait ? width / 16 : width / 26) * fontSizeMultiplier)
  const paddingBottom = Math.round(height * 0.12)
  const paddingH = Math.round(width * 0.06)
  const maxWidth = Math.round(width * 0.85)
  const strokeWidth = Math.max(2, Math.round(fontSize * 0.045))

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
              fontSize,
              gap: '0.5em',
              justifyContent: 'center',
              maxWidth,
            }}
          >
            {visibleWords.map((word, i) => {
              const isCurrent = currentTime >= word.start && currentTime < word.end
              const wordFrameStart = Math.max(0, Math.floor(word.start * fps))
              const elapsed = Math.max(0, frame - wordFrameStart)

              const riseSpring = spring({
                frame: elapsed,
                fps,
                config: { damping: 18, stiffness: 210, mass: 0.7 },
                from: Math.round(fontSize * 0.35),
                to: 0,
              })
              const opacity = interpolate(elapsed, [0, 5], [0, 1], {
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
                    textShadow: '0 3px 10px rgba(0,0,0,0.85)',
                    display: 'inline-block',
                    transform: `translateY(${riseSpring}px)`,
                    opacity,
                    lineHeight: 1.1,
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
