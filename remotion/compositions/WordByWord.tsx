import React from 'react'
import { AbsoluteFill, useCurrentFrame, useVideoConfig, OffthreadVideo, spring } from 'remotion'
import type { Transcript } from '../types'

export interface WordByWordProps {
  transcript: Transcript
  videoSrc: string
  activeColor?: string
  textColor?: string
  fontFamily?: string
  fontSizeMultiplier?: number
}

export const WordByWord: React.FC<WordByWordProps> = ({
  transcript,
  videoSrc,
  activeColor = '#FACC15',
  textColor = '#FFFFFF',
  fontFamily = 'system-ui, -apple-system, sans-serif',
  fontSizeMultiplier = 1,
}) => {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()
  const currentTime = frame / fps
  const isPortrait = height > width
  const fontSize = Math.round((isPortrait ? width / 18 : width / 28) * fontSizeMultiplier)
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
    <AbsoluteFill style={{ backgroundColor: 'transparent' }}>
      {videoSrc && (
        <OffthreadVideo
          src={videoSrc}
          crossOrigin="anonymous"
          pauseWhenBuffering
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
              gap: '0.6em',
              justifyContent: 'center',
              maxWidth,
            }}
          >
            {visibleWords.map((word, i) => {
              const isCurrent = currentTime >= word.start && currentTime < word.end
              const wordFrameStart = Math.max(0, Math.floor(word.start * fps))
              const elapsed = Math.max(0, frame - wordFrameStart)

              const scale = isCurrent
                ? spring({ frame: elapsed, fps, config: { damping: 14, stiffness: 220, mass: 0.8 } })
                : 1

              return (
                <span
                  key={i}
                  style={{
                    fontSize,
                    fontWeight: 900,
                    fontFamily,
                    color: isCurrent ? activeColor : `${textColor}e6`,
                    textShadow: isCurrent
                      ? `0 0 40px ${activeColor}80, 0 3px 24px rgba(0,0,0,0.9)`
                      : '0 3px 24px rgba(0,0,0,0.9)',
                    display: 'inline-block',
                    transform: `scale(${0.85 + scale * 0.15})`,
                    transformOrigin: 'center bottom',
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
