import React from 'react'
import { AbsoluteFill, useCurrentFrame, useVideoConfig, OffthreadVideo, interpolate } from 'remotion'
import { loadFont } from '@remotion/google-fonts/Roboto'
import type { Transcript, TranscriptSegment } from '../types'

const { fontFamily: ROBOTO } = loadFont('normal', { weights: ['700'], subsets: ['latin'] })

export interface PillProps {
  transcript: Transcript
  videoSrc: string
  activeColor?: string
  textColor?: string
  fontFamily?: string
  fontSizeMultiplier?: number
}

// VEED "Box Highlight" clean style: sentence case, solid dark pill background,
// soft drop shadow, no per-word hype — professional/subtle look.
export const Pill: React.FC<PillProps> = ({
  transcript,
  videoSrc,
  activeColor = '#1F2937',
  textColor = '#FFFFFF',
  fontFamily = ROBOTO,
  fontSizeMultiplier = 1,
}) => {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()
  const currentTime = frame / fps
  const isPortrait = height > width
  const fontSize = Math.round((isPortrait ? width / 20 : width / 32) * fontSizeMultiplier)
  const paddingBottom = Math.round(height * 0.09)
  const paddingH = Math.round(width * 0.06)
  const maxWidth = Math.round(width * 0.8)

  const CHUNK_SIZE = 4
  const fadeDuration = 0.15

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
  const chunkText = visibleWords.map((w) => w.word).join(' ')
  const chunkStartTime = visibleWords.length > 0 ? visibleWords[0].start : currentSegment?.start ?? 0

  const opacity = currentSegment
    ? interpolate(
        currentTime,
        [chunkStartTime, chunkStartTime + fadeDuration],
        [0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      )
    : 0

  return (
    <AbsoluteFill>
      {videoSrc && (
        <OffthreadVideo src={videoSrc} crossOrigin="anonymous" pauseWhenBuffering style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
              backgroundColor: activeColor,
              borderRadius: Math.round(fontSize * 0.5),
              padding: `${Math.round(fontSize * 0.35)}px ${Math.round(fontSize * 0.7)}px`,
              boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
              opacity,
              maxWidth,
            }}
          >
            <p
              style={{
                fontSize,
                fontWeight: 700,
                fontFamily,
                color: textColor,
                textAlign: 'center',
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              {chunkText}
            </p>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  )
}
