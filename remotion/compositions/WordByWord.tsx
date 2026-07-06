import React from 'react'
import { AbsoluteFill, useCurrentFrame, useVideoConfig, Video, spring } from 'remotion'
import type { Transcript } from '../types'

export interface WordByWordProps {
  transcript: Transcript
  videoSrc: string
}

const WINDOW_BEFORE = 2
const WINDOW_AFTER = 3

export const WordByWord: React.FC<WordByWordProps> = ({ transcript, videoSrc }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const currentTime = frame / fps

  const currentIndex = transcript.words.findIndex(
    (w) => currentTime >= w.start && currentTime < w.end
  )
  const activeIndex = currentIndex === -1
    ? transcript.words.filter((w) => currentTime >= w.end).length - 1
    : currentIndex

  const winStart = Math.max(0, activeIndex - WINDOW_BEFORE)
  const winEnd = Math.min(transcript.words.length, activeIndex + WINDOW_AFTER + 1)
  const visibleWords = transcript.words.slice(winStart, winEnd)

  return (
    <AbsoluteFill style={{ backgroundColor: 'transparent' }}>
      {videoSrc && (
        <Video
          src={videoSrc}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
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
            gap: '0.25em',
            justifyContent: 'center',
            maxWidth: 1400,
          }}
        >
          {visibleWords.map((word, i) => {
            const wordIndex = winStart + i
            const isCurrent = wordIndex === activeIndex
            const wordFrameStart = Math.max(0, Math.floor(word.start * fps))
            const elapsed = Math.max(0, frame - wordFrameStart)

            const scale = isCurrent
              ? spring({ frame: elapsed, fps, config: { damping: 14, stiffness: 220, mass: 0.8 } })
              : 1

            return (
              <span
                key={`${wordIndex}-${word.word}`}
                style={{
                  fontSize: 68,
                  fontWeight: 900,
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  color: isCurrent ? '#FACC15' : 'rgba(255,255,255,0.9)',
                  textShadow: isCurrent
                    ? '0 0 40px rgba(250,204,21,0.5), 0 3px 24px rgba(0,0,0,0.9)'
                    : '0 3px 24px rgba(0,0,0,0.9)',
                  display: 'inline-block',
                  transform: `scale(${0.85 + scale * 0.15})`,
                  transformOrigin: 'center bottom',
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
