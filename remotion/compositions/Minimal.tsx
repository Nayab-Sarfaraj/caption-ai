import React from 'react'
import { AbsoluteFill, useCurrentFrame, useVideoConfig, OffthreadVideo, interpolate } from 'remotion'
import { loadFont } from '@remotion/google-fonts/Inter'
import type { Transcript, TranscriptSegment } from '../types'

const { fontFamily: INTER } = loadFont('normal', { weights: ['500'], subsets: ['latin'] })

export interface MinimalProps {
  transcript: Transcript
  videoSrc: string
  activeColor?: string
  textColor?: string
  fontFamily?: string
  fontSizeMultiplier?: number
}

// "Iman Gadzhi / Ali Abdaal style": lowercase, single flat color, no per-word
// emphasis or bounce — just a smooth crossfade between phrases. Deliberately
// restrained, for creators who don't want the hype-caption look.
export const Minimal: React.FC<MinimalProps> = ({
  transcript,
  videoSrc,
  textColor = '#FFFFFF',
  fontFamily = INTER,
  fontSizeMultiplier = 1,
}) => {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()
  const currentTime = frame / fps
  const isPortrait = height > width
  const fontSize = Math.round((isPortrait ? width / 20 : width / 34) * fontSizeMultiplier)
  const paddingBottom = Math.round(height * 0.09)
  const paddingH = Math.round(width * 0.08)
  const maxWidth = Math.round(width * 0.8)

  const CHUNK_SIZE = 6
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
  const chunkText = visibleWords.map((w) => w.word).join(' ').toLowerCase()
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
          <p
            style={{
              fontSize,
              fontWeight: 500,
              fontFamily,
              color: textColor,
              textShadow: '0 2px 10px rgba(0,0,0,0.7)',
              textAlign: 'center',
              opacity,
              maxWidth,
              lineHeight: 1.4,
              letterSpacing: '-0.01em',
              wordSpacing: '0.2em',
            }}
          >
            {chunkText}
          </p>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  )
}
