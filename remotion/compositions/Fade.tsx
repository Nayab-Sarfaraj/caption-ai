import React from 'react'
import { AbsoluteFill, useCurrentFrame, useVideoConfig, Video, interpolate } from 'remotion'
import type { Transcript, TranscriptSegment } from '../types'

export interface FadeProps {
  transcript: Transcript
  videoSrc: string
}

export const Fade: React.FC<FadeProps> = ({ transcript, videoSrc }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const currentTime = frame / fps

  const currentSegment: TranscriptSegment | undefined = transcript.segments.find(
    (s) => currentTime >= s.start && currentTime < s.end
  )

  const fadeDuration = 0.2 // seconds

  const opacity = currentSegment
    ? interpolate(
        currentTime,
        [currentSegment.start, currentSegment.start + fadeDuration],
        [0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      )
    : 0

  return (
    <AbsoluteFill>
      {videoSrc && (
        <Video src={videoSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      )}
      {currentSegment && (
        <AbsoluteFill
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            paddingBottom: 90,
            paddingLeft: 80,
            paddingRight: 80,
          }}
        >
          <p
            style={{
              fontSize: 64,
              fontWeight: 700,
              fontFamily: 'system-ui, -apple-system, sans-serif',
              color: 'white',
              textShadow: '0 3px 20px rgba(0,0,0,0.9)',
              textAlign: 'center',
              opacity,
              maxWidth: 1200,
              lineHeight: 1.3,
            }}
          >
            {currentSegment.text}
          </p>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  )
}
