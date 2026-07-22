import React from 'react'
import { AbsoluteFill, useCurrentFrame, useVideoConfig, OffthreadVideo, interpolate } from 'remotion'
import { withScriptFallback } from '../lib/fonts'
import type { Transcript } from '../types'
import { captionAnchorStyle } from '../lib/caption-layout'

export interface HighlighterProps {
  transcript: Transcript
  videoSrc: string
  activeColor?: string
  textColor?: string
  fontFamily?: string
  fontSizeMultiplier?: number
  posX?: number
  posY?: number
}

// Marker-swipe highlight: the active word gets a highlighter stroke that swipes
// in left→right (organic, not the hard BoxHighlight box). Dark text over the
// marker; white otherwise.
export const Highlighter: React.FC<HighlighterProps> = ({
  transcript,
  videoSrc,
  activeColor = '#FDE047',
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
  const fontSize = Math.round((isPortrait ? width / 18 : width / 28) * fontSizeMultiplier)
  const paddingBottom = Math.round(height * 0.1)
  const paddingH = Math.round(width * 0.06)
  const maxWidth = Math.round(width * 0.88)

  const CHUNK_SIZE = 5
  const currentSegment = transcript.segments.find((s) => currentTime >= s.start && currentTime < s.end)
  const currentWordIdx = currentSegment
    ? currentSegment.words.findIndex((w) => currentTime >= w.start && currentTime < w.end)
    : -1
  const activeIdx =
    currentWordIdx >= 0 ? currentWordIdx
    : currentSegment ? currentSegment.words.reduce((acc, w, i) => (currentTime >= w.start ? i : acc), 0)
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
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3em', justifyContent: 'center', maxWidth }}>
            {visibleWords.map((word, i) => {
              const isCurrent = currentTime >= word.start && currentTime < word.end
              const isPast = currentTime >= word.end
              const highlighted = isCurrent || isPast
              const elapsed = Math.max(0, frame - Math.floor(word.start * fps))
              const swipe = interpolate(elapsed, [0, 4], [0, 100], { extrapolateRight: 'clamp' })
              return (
                <span
                  key={i}
                  style={{
                    fontSize,
                    fontWeight: 800,
                    fontFamily: withScriptFallback(fontFamily),
                    color: highlighted ? '#171717' : textColor,
                    backgroundImage: highlighted ? `linear-gradient(${activeColor}, ${activeColor})` : 'none',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'left center',
                    backgroundSize: highlighted ? `${swipe}% 82%` : '0% 82%',
                    padding: '0 0.14em',
                    borderRadius: '0.08em',
                    textShadow: highlighted ? 'none' : '0 2px 8px rgba(0,0,0,0.85)',
                    lineHeight: 1.35,
                    display: 'inline-block',
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
