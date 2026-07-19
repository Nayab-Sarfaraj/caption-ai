import React from 'react'
import { AbsoluteFill, useCurrentFrame, useVideoConfig, OffthreadVideo } from 'remotion'
import { loadFont } from '@remotion/google-fonts/Fredoka'
import { withScriptFallback } from '../lib/fonts'
import type { Transcript, TranscriptSegment } from '../types'

const { fontFamily: FREDOKA } = loadFont('normal', { weights: ['700'], subsets: ['latin'] })

export interface ComicProps {
  transcript: Transcript
  videoSrc: string
  activeColor?: string
  textColor?: string
  fontFamily?: string
  fontSizeMultiplier?: number
}

// VEED "Impact/Colour Highlight" style: rounded cartoon font, black stroke,
// current word swaps to an accent color. Static — no bounce, no box —
// deliberately more graphic/flat than Hype.
export const Comic: React.FC<ComicProps> = ({
  transcript,
  videoSrc,
  activeColor = '#38BDF8',
  textColor = '#FFFFFF',
  fontFamily = FREDOKA,
  fontSizeMultiplier = 1,
}) => {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()
  const currentTime = frame / fps
  const isPortrait = height > width
  const fontSize = Math.round((isPortrait ? width / 16 : width / 26) * fontSizeMultiplier)
  const paddingBottom = Math.round(height * 0.1)
  const paddingH = Math.round(width * 0.06)
  const maxWidth = Math.round(width * 0.85)
  const strokeWidth = Math.max(2, Math.round(fontSize * 0.05))

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
              display: 'flex',
              flexWrap: 'wrap',
              fontSize,
              gap: '0.5em',
              justifyContent: 'center',
              maxWidth,
            }}
          >
            {visibleWords.map((word, i) => {
              const isCurrent = currentTime >= word.start && currentTime < word.end
              const isPast = currentTime >= word.end

              return (
                <span
                  key={i}
                  style={{
                    fontSize,
                    fontWeight: 700,
                    fontFamily: withScriptFallback(fontFamily),
                    textTransform: 'uppercase',
                    color: isCurrent ? activeColor : isPast ? `${textColor}b3` : textColor,
                    WebkitTextStroke: `${strokeWidth}px #000000`,
                    paintOrder: 'stroke fill',
                    display: 'inline-block',
                    lineHeight: 1.15,
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
