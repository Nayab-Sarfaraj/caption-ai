import React from 'react'
import { AbsoluteFill, useCurrentFrame, useVideoConfig, OffthreadVideo, spring } from 'remotion'
import { loadFont } from '@remotion/google-fonts/Montserrat'
import { withScriptFallback } from '../lib/fonts'
import type { Transcript } from '../types'
import { captionAnchorStyle } from '../lib/caption-layout'

const { fontFamily: MONTSERRAT } = loadFont('normal', { weights: ['900'], subsets: ['latin'] })

export interface BoxHighlightProps {
  transcript: Transcript
  videoSrc: string
  activeColor?: string
  textColor?: string
  accentColor?: string
  fontFamily?: string
  fontSizeMultiplier?: number
  posX?: number
  posY?: number
}

// Captions.ai "AI Edit" style: short word chunks, most words plain white,
// current word sits inside a solid color pill with a bright accent text color.
export const BoxHighlight: React.FC<BoxHighlightProps> = ({
  transcript,
  videoSrc,
  activeColor = '#7C3AED',
  textColor = '#FFFFFF',
  accentColor = '#A3E635',
  fontFamily = MONTSERRAT,
  fontSizeMultiplier = 1,
  posX,
  posY,
}) => {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()
  const currentTime = frame / fps
  const isPortrait = height > width
  const fontSize = Math.round((isPortrait ? width / 16 : width / 26) * fontSizeMultiplier)
  const paddingBottom = Math.round(height * 0.1)
  const paddingH = Math.round(width * 0.06)
  const maxWidth = Math.round(width * 0.85)
  const boxRadius = Math.round(fontSize * 0.18)

  const CHUNK_SIZE = 3

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
        <OffthreadVideo src={videoSrc} crossOrigin="anonymous" pauseWhenBuffering style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      )}
      {currentSegment && (
        <AbsoluteFill
          style={{
            ...captionAnchorStyle(paddingBottom, posX, posY),
            paddingLeft: paddingH,
            paddingRight: paddingH,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              fontSize,
              gap: '0.4em',
              alignItems: 'center',
              justifyContent: 'center',
              maxWidth,
            }}
          >
            {visibleWords.map((word, i) => {
              const isCurrent = currentTime >= word.start && currentTime < word.end
              const wordFrameStart = Math.max(0, Math.floor(word.start * fps))
              const elapsed = Math.max(0, frame - wordFrameStart)

              const pop = isCurrent
                ? spring({ frame: elapsed, fps, config: { damping: 16, stiffness: 240, mass: 0.7 } })
                : 1

              return (
                <span
                  key={i}
                  style={{
                    fontSize,
                    fontWeight: 900,
                    fontFamily: withScriptFallback(fontFamily),
                    textTransform: 'uppercase',
                    display: 'inline-block',
                    lineHeight: 1.15,
                    transform: `scale(${isCurrent ? 0.85 + pop * 0.15 : 1})`,
                    ...(isCurrent
                      ? {
                          color: accentColor,
                          backgroundColor: activeColor,
                          borderRadius: boxRadius,
                          padding: `${Math.round(fontSize * 0.05)}px ${Math.round(fontSize * 0.22)}px`,
                          textShadow: 'none',
                        }
                      : {
                          color: textColor,
                          textShadow: '0 3px 12px rgba(0,0,0,0.85)',
                        }),
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
