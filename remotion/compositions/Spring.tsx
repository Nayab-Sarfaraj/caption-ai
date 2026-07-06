import React from 'react'
import { AbsoluteFill, useCurrentFrame, useVideoConfig, Video, spring, interpolate } from 'remotion'
import type { Transcript } from '../types'

export interface SpringProps {
  transcript: Transcript
  videoSrc: string
  activeColor?: string
  textColor?: string
}

export const Spring: React.FC<SpringProps> = ({
  transcript,
  videoSrc,
  activeColor = '#FACC15',
  textColor = '#FFFFFF',
}) => {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()
  const currentTime = frame / fps
  const isPortrait = height > width
  const fontSize = isPortrait ? Math.round(width / 18) : Math.round(width / 28)
  const paddingBottom = Math.round(height * 0.08)
  const paddingH = Math.round(width * 0.05)
  const maxWidth = Math.round(width * 0.88)

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
        <Video
          src={videoSrc}
          crossOrigin="anonymous"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
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
              gap: '0.45em',
              justifyContent: 'center',
              maxWidth,
            }}
          >
            {visibleWords.map((word, i) => {
              const isCurrent = currentTime >= word.start && currentTime < word.end
              // Stagger resets per chunk so new chunk words spring in
              const chunkFrameStart = Math.floor(visibleWords[0].start * fps)
              const staggeredStart = chunkFrameStart + i * 3
              const elapsed = Math.max(0, frame - staggeredStart)

              const ySpring = spring({
                frame: elapsed,
                fps,
                config: { damping: 12, stiffness: 200, mass: 0.8 },
                from: Math.round(fontSize * 0.8),
                to: 0,
              })

              const opacityVal = interpolate(elapsed, [0, 6], [0, 1], {
                extrapolateRight: 'clamp',
              })

              return (
                <span
                  key={i}
                  style={{
                    fontSize,
                    fontWeight: 900,
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    color: isCurrent ? activeColor : textColor,
                    textShadow: '0 3px 24px rgba(0,0,0,0.9)',
                    display: 'inline-block',
                    transform: `translateY(${ySpring}px)`,
                    opacity: opacityVal,
                    lineHeight: 1.2,
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
