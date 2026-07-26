import React from 'react'
import { AbsoluteFill, useCurrentFrame, useVideoConfig, OffthreadVideo, spring } from 'remotion'
import { loadFont as loadBaseFont } from '@remotion/google-fonts/Inter'
import { loadFont as loadScriptFont } from '@remotion/google-fonts/Caveat'
import { withScriptFallback } from '../lib/fonts'
import type { Transcript, TranscriptSegment } from '../types'
import { captionAnchorStyle } from '../lib/caption-layout'

const { fontFamily: INTER } = loadBaseFont('normal', { weights: ['500'], subsets: ['latin'] })
const { fontFamily: CAVEAT } = loadScriptFont('normal', { weights: ['700'], subsets: ['latin'] })

export interface ScriptProps {
  transcript: Transcript
  videoSrc: string
  activeColor?: string
  textColor?: string
  fontFamily?: string
  fontSizeMultiplier?: number
  posX?: number
  posY?: number
}

// VEED "Handwritten/Whisper" style: plain sentence-case base text, current
// word swaps into a gold italic script font — editorial, non-hype accent.
export const Script: React.FC<ScriptProps> = ({
  transcript,
  videoSrc,
  activeColor = '#FBBF24',
  textColor = '#FFFFFF',
  fontFamily = INTER,
  fontSizeMultiplier = 1,
  posX,
  posY,
}) => {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()
  const currentTime = frame / fps
  const isPortrait = height > width
  const fontSize = Math.round((isPortrait ? width / 18 : width / 30) * fontSizeMultiplier)
  const paddingBottom = Math.round(height * 0.09)
  const paddingH = Math.round(width * 0.06)
  const maxWidth = Math.round(width * 0.82)

  const CHUNK_SIZE = 6

  const currentSegment: TranscriptSegment | undefined = transcript.segments.find(
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
              backgroundColor: 'rgba(17,17,17,0.72)',
              borderRadius: Math.round(fontSize * 0.3),
              padding: `${Math.round(fontSize * 0.3)}px ${Math.round(fontSize * 0.55)}px`,
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              display: 'flex',
              flexWrap: 'wrap',
              fontSize,
              gap: '0.35em',
              alignItems: 'baseline',
              justifyContent: 'center',
              maxWidth,
            }}
          >
            {visibleWords.map((word, i) => {
              const isCurrent = currentTime >= word.start && currentTime < word.end
              const wordFrameStart = Math.max(0, Math.floor(word.start * fps))
              const elapsed = Math.max(0, frame - wordFrameStart)

              const pop = isCurrent
                ? spring({ frame: elapsed, fps, config: { damping: 16, stiffness: 200, mass: 0.7 } })
                : 1

              return (
                <span
                  key={i}
                  style={{
                    fontSize: isCurrent ? Math.round(fontSize * 1.15) : fontSize,
                    fontWeight: isCurrent ? 700 : 500,
                    fontFamily: isCurrent ? withScriptFallback(CAVEAT) : withScriptFallback(fontFamily),
                    fontStyle: isCurrent ? 'italic' : 'normal',
                    color: isCurrent ? activeColor : textColor,
                    display: 'inline-block',
                    transform: `scale(${isCurrent ? 0.85 + pop * 0.15 : 1})`,
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
