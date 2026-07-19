import React from 'react'
import { AbsoluteFill, useCurrentFrame, useVideoConfig, OffthreadVideo } from 'remotion'
import { withScriptFallback } from '../lib/fonts'
import type { Transcript, TranscriptSegment } from '../types'

export interface KaraokeProps {
  transcript: Transcript
  videoSrc: string
  activeColor?: string
  textColor?: string
  fontFamily?: string
  fontSizeMultiplier?: number
}

export const Karaoke: React.FC<KaraokeProps> = ({
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
  const fontSize = Math.round((isPortrait ? width / 18 : width / 30) * fontSizeMultiplier)
  const paddingBottom = Math.round(height * 0.075)
  const paddingH = Math.round(width * 0.05)
  const maxWidth = Math.round(width * 0.88)

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

  if (!currentSegment) return (
    <AbsoluteFill>
      {videoSrc && <OffthreadVideo src={videoSrc} crossOrigin="anonymous" pauseWhenBuffering style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
    </AbsoluteFill>
  )

  return (
    <AbsoluteFill>
      {videoSrc && (
        <OffthreadVideo src={videoSrc} crossOrigin="anonymous" pauseWhenBuffering style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      )}
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
            backgroundColor: 'rgba(0,0,0,0.65)',
            borderRadius: 16,
            padding: `${Math.round(fontSize * 0.3)}px ${Math.round(fontSize * 0.6)}px`,
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.6em',
            justifyContent: 'center',
            maxWidth,
          }}
        >
          {visibleWords.map((word, i) => {
            const isCurrent =
              currentTime >= word.start && currentTime < word.end
            const isPast = currentTime >= word.end

            return (
              <span
                key={i}
                style={{
                  fontSize,
                  fontWeight: 800,
                  fontFamily: withScriptFallback(fontFamily),
                  color: isCurrent
                    ? activeColor
                    : isPast
                    ? `${textColor}80`
                    : textColor,
                  textShadow: '0 2px 8px rgba(0,0,0,0.8)',
                  display: 'inline-block',
                  transition: 'color 0.05s',
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
