import React from 'react'
import { AbsoluteFill, interpolate, OffthreadVideo, useCurrentFrame, useVideoConfig } from 'remotion'
import { withScriptFallback } from '../lib/fonts'
import { captionAnchorStyle } from '../lib/caption-layout'
import type { Transcript } from '../types'

const STRIP_COLORS = ['#FFF8DD', '#FFF0A8', '#FFE3E8']

export interface SoftCandyProps {
  transcript: Transcript; videoSrc: string; activeColor?: string; textColor?: string; fontFamily?: string; fontSizeMultiplier?: number; posX?: number; posY?: number
}

/** Short editorial strips with calm staggered entry; no spring, glow, or heavy outline. */
export const SoftCandy: React.FC<SoftCandyProps> = ({ transcript, videoSrc, activeColor = '#D63D61', textColor = '#34231F', fontFamily = 'Montserrat, system-ui, sans-serif', fontSizeMultiplier = 1, posX, posY }) => {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()
  const time = frame / fps
  const segment = transcript.segments.find((s) => time >= s.start && time < s.end)
  const active = segment?.words.findIndex((word) => time >= word.start && time < word.end) ?? -1
  const segmentWords = segment?.words.slice(0, 6) ?? []
  const groups = segmentWords.reduce<typeof segmentWords[]>((all, word, index) => {
    if (index % 2 === 0) all.push([])
    all[all.length - 1].push(word)
    return all
  }, [])
  const fontSize = Math.round((height > width ? width / 23 : width / 38) * fontSizeMultiplier)
  const segmentFrame = segment ? frame - Math.floor(segment.start * fps) : 0

  return <AbsoluteFill>
    {videoSrc && <OffthreadVideo src={videoSrc} crossOrigin="anonymous" pauseWhenBuffering style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
    {segment && <AbsoluteFill style={{ ...captionAnchorStyle(Math.round(height * 0.16), posX, posY), paddingLeft: width * 0.05, paddingRight: width * 0.05 }}>
      <div style={{ alignItems: 'center', display: 'flex', flexDirection: 'column', gap: Math.round(fontSize * 0.22), maxWidth: width * 0.84 }}>
        {groups.map((group, groupIndex) => {
          const enter = interpolate(segmentFrame - groupIndex * 2, [0, 6], [0, 1], { extrapolateRight: 'clamp' })
          return <div key={groupIndex} style={{ backgroundColor: STRIP_COLORS[groupIndex % STRIP_COLORS.length], borderRadius: Math.max(2, Math.round(fontSize * 0.08)), display: 'inline-flex', gap: '0.3em', opacity: enter, padding: `${Math.round(fontSize * 0.22)}px ${Math.round(fontSize * 0.45)}px`, transform: `translateY(${(1 - enter) * 8}px)` }}>
            {group.map((word, index) => {
              const wordIndex = groupIndex * 2 + index
              return <span key={`${word.start}-${index}`} style={{ color: wordIndex === active ? activeColor : textColor, fontFamily: withScriptFallback(fontFamily), fontSize, fontWeight: wordIndex === active ? 800 : 600, lineHeight: 1.2 }}>{word.word}</span>
            })}
          </div>
        })}
      </div>
    </AbsoluteFill>}
  </AbsoluteFill>
}
