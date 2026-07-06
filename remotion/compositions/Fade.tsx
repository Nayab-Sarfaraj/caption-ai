import React from 'react'
import { AbsoluteFill, useCurrentFrame, useVideoConfig, Video, interpolate } from 'remotion'
import type { Transcript, TranscriptSegment } from '../types'

export interface FadeProps {
  transcript: Transcript
  videoSrc: string
  activeColor?: string
  textColor?: string
  fontFamily?: string
  fontSizeMultiplier?: number
}

export const Fade: React.FC<FadeProps> = ({
  transcript,
  videoSrc,
  textColor = '#FFFFFF',
  fontFamily = 'system-ui, -apple-system, sans-serif',
  fontSizeMultiplier = 1,
}) => {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()
  const currentTime = frame / fps
  const isPortrait = height > width
  const fontSize = Math.round((isPortrait ? width / 18 : width / 30) * fontSizeMultiplier)
  const paddingBottom = Math.round(height * 0.08)
  const paddingH = Math.round(width * 0.05)
  const maxWidth = Math.round(width * 0.85)

  const CHUNK_SIZE = 5

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

  const fadeDuration = 0.2

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
          <p
            style={{
              fontSize,
              fontWeight: 700,
              fontFamily,
              color: textColor,
              textShadow: '0 3px 20px rgba(0,0,0,0.9)',
              textAlign: 'center',
              opacity,
              maxWidth,
              lineHeight: 1.3,
            }}
          >
            {chunkText}
          </p>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  )
}
