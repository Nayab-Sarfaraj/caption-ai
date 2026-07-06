import React from 'react'
import { AbsoluteFill, useCurrentFrame, useVideoConfig, Video } from 'remotion'
import type { Transcript, TranscriptSegment } from '../types'

export interface KaraokeProps {
  transcript: Transcript
  videoSrc: string
}

export const Karaoke: React.FC<KaraokeProps> = ({ transcript, videoSrc }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const currentTime = frame / fps

  const currentSegment: TranscriptSegment | undefined = transcript.segments.find(
    (s) => currentTime >= s.start && currentTime < s.end
  )

  if (!currentSegment) return (
    <AbsoluteFill>
      {videoSrc && <Video src={videoSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
    </AbsoluteFill>
  )

  return (
    <AbsoluteFill>
      {videoSrc && (
        <Video src={videoSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      )}
      <AbsoluteFill
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          paddingBottom: 80,
          paddingLeft: 60,
          paddingRight: 60,
        }}
      >
        <div
          style={{
            backgroundColor: 'rgba(0,0,0,0.65)',
            borderRadius: 16,
            padding: '20px 40px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.3em',
            justifyContent: 'center',
            maxWidth: 1400,
          }}
        >
          {currentSegment.words.map((word, i) => {
            const isCurrent =
              currentTime >= word.start && currentTime < word.end
            const isPast = currentTime >= word.end

            return (
              <span
                key={i}
                style={{
                  fontSize: 64,
                  fontWeight: 800,
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  color: isCurrent
                    ? '#FACC15'
                    : isPast
                    ? 'rgba(255,255,255,0.5)'
                    : 'white',
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
