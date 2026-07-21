import React from 'react'
import { AbsoluteFill, useCurrentFrame, useVideoConfig, OffthreadVideo, interpolate } from 'remotion'
import { withScriptFallback } from '../lib/fonts'
import type { Transcript } from '../types'
import { captionAnchorStyle } from '../lib/caption-layout'

export interface CaptionBarProps {
  transcript: Transcript
  videoSrc: string
  activeColor?: string
  textColor?: string
  fontFamily?: string
  fontSizeMultiplier?: number
  posX?: number
  posY?: number
}

// A solid rounded bar behind the whole caption line — the clean podcast /
// faceless look (CapCut "Frame"). Active word tints; the bar keeps text legible
// over any footage without per-word boxes.
export const CaptionBar: React.FC<CaptionBarProps> = ({
  transcript,
  videoSrc,
  activeColor = '#FACC15',
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
  const fontSize = Math.round((isPortrait ? width / 20 : width / 32) * fontSizeMultiplier)
  const paddingBottom = Math.round(height * 0.1)
  const paddingH = Math.round(width * 0.05)
  const maxWidth = Math.round(width * 0.9)

  const CHUNK_SIZE = 6
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
          {(() => {
            const segElapsed = Math.max(0, frame - Math.floor(currentSegment.start * fps))
            const barIn = interpolate(segElapsed, [0, 5], [0, 1], { extrapolateRight: 'clamp' })
            return (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.32em',
                  justifyContent: 'center',
                  alignItems: 'center',
                  maxWidth,
                  backgroundColor: 'rgba(12,12,11,0.82)',
                  borderRadius: Math.round(fontSize * 0.5),
                  padding: `${Math.round(fontSize * 0.42)}px ${Math.round(fontSize * 0.7)}px`,
                  opacity: barIn,
                  transform: `translateY(${(1 - barIn) * 10}px)`,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.45)',
                }}
              >
                {visibleWords.map((word, i) => {
                  const isCurrent = currentTime >= word.start && currentTime < word.end
                  return (
                    <span
                      key={i}
                      style={{
                        fontSize,
                        fontWeight: 700,
                        fontFamily: withScriptFallback(fontFamily),
                        color: isCurrent ? activeColor : textColor,
                        lineHeight: 1.2,
                        display: 'inline-block',
                      }}
                    >
                      {word.word}
                    </span>
                  )
                })}
              </div>
            )
          })()}
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  )
}
