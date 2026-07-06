import React from 'react'
import { AbsoluteFill, useCurrentFrame, useVideoConfig, Video, spring, interpolate } from 'remotion'
import type { Transcript } from '../types'

export interface SpringProps {
  transcript: Transcript
  videoSrc: string
}

export const Spring: React.FC<SpringProps> = ({ transcript, videoSrc }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const currentTime = frame / fps

  const currentIndex = transcript.words.findIndex(
    (w) => currentTime >= w.start && currentTime < w.end
  )
  const activeIndex = currentIndex === -1
    ? transcript.words.filter((w) => currentTime >= w.end).length - 1
    : currentIndex

  const winStart = Math.max(0, activeIndex - 1)
  const winEnd = Math.min(transcript.words.length, activeIndex + 5)
  const visibleWords = transcript.words.slice(winStart, winEnd)

  return (
    <AbsoluteFill>
      {videoSrc && (
        <Video src={videoSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      )}
      <AbsoluteFill
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          paddingBottom: 100,
          paddingLeft: 80,
          paddingRight: 80,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.3em',
            justifyContent: 'center',
            maxWidth: 1400,
          }}
        >
          {visibleWords.map((word, i) => {
            const wordIndex = winStart + i
            const wordFrameStart = Math.floor(word.start * fps)
            const elapsed = Math.max(0, frame - wordFrameStart)
            const isCurrent = wordIndex === activeIndex

            const ySpring = spring({
              frame: elapsed,
              fps,
              config: { damping: 12, stiffness: 180, mass: 1 },
              from: 60,
              to: 0,
            })

            const opacityVal = interpolate(elapsed, [0, 8], [0, 1], {
              extrapolateRight: 'clamp',
            })

            return (
              <span
                key={`${wordIndex}-${word.word}`}
                style={{
                  fontSize: 68,
                  fontWeight: 900,
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  color: isCurrent ? '#FACC15' : 'white',
                  textShadow: '0 3px 24px rgba(0,0,0,0.9)',
                  display: 'inline-block',
                  transform: `translateY(${ySpring}px)`,
                  opacity: opacityVal,
                  lineHeight: 1.15,
                }}
              >
                {word.word}
              </span>
            )
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}
