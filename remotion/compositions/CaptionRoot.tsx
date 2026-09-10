import React from 'react'
import { AbsoluteFill, useVideoConfig, useCurrentFrame, interpolate } from 'remotion'
import { WordByWord } from './WordByWord'
import { Karaoke } from './Karaoke'
import { Fade } from './Fade'
import { Spring } from './Spring'
import { Hype } from './Hype'
import { Hormozi } from './Hormozi'
import { Minimal } from './Minimal'
import { BoxHighlight } from './BoxHighlight'
import { Comic } from './Comic'
import { Pill } from './Pill'
import { Script } from './Script'
import { SingleWord } from './SingleWord'
import { Typewriter } from './Typewriter'
import { NeonGlow } from './NeonGlow'
import { CaptionBar } from './CaptionBar'
import { Gradient } from './Gradient'
import { Highlighter } from './Highlighter'
import { Underline } from './Underline'
import { Glide } from './Glide'
import { Outline } from './Outline'
import { Meme } from './Meme'
import { Pulse } from './Pulse'
import { Sticker } from './Sticker'
import { Glitch } from './Glitch'
import { Wave } from './Wave'
import { Handwritten } from './Handwritten'
import { NewsBar } from './NewsBar'
import { WordHighlight } from './WordHighlight'
import { KaraokeFill } from './KaraokeFill'
import { FocusCard } from './FocusCard'
import { ComicStrip } from './ComicStrip'
import { SoftCandy } from './SoftCandy'
import { RetroScript } from './RetroScript'
import type { Transcript } from '../types'

export type CompositionId = 'WordByWord' | 'Karaoke' | 'Fade' | 'Spring' | 'Hype' | 'Hormozi' | 'Minimal' | 'BoxHighlight' | 'Comic' | 'Pill' | 'Script' | 'SingleWord' | 'Typewriter' | 'NeonGlow' | 'CaptionBar' | 'Gradient' | 'Highlighter' | 'Underline' | 'Glide' | 'Outline' | 'Meme' | 'Pulse' | 'Sticker' | 'Glitch' | 'Wave' | 'Handwritten' | 'NewsBar' | 'WordHighlight' | 'KaraokeFill' | 'FocusCard' | 'ComicStrip' | 'SoftCandy' | 'RetroScript'

export interface CaptionRootProps {
  style: CompositionId
  transcript: Transcript
  videoSrc: string
  activeColor?: string
  textColor?: string
  accentColor?: string
  fontFamily?: string
  fontSizeMultiplier?: number
  posX?: number
  posY?: number
  watermark?: boolean
  newsHeadline?: string
  newsCategory?: string
}

// Prominent, highly visible top-right watermark pill badge matching user mockup
const Watermark: React.FC = () => {
  const { width, height } = useVideoConfig()
  const isPortrait = height > width
  const fontSize = Math.round(isPortrait ? width / 34 : height / 32)
  const dotSize = Math.max(6, Math.round(fontSize * 0.44))

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 998 }}>
      <div
        style={{
          position: 'absolute',
          top: '3.5%',
          right: '3.5%',
          fontSize,
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
          fontWeight: 700,
          color: '#FFFFFF',
          backgroundColor: 'rgba(8, 8, 8, 0.88)',
          padding: `${Math.round(fontSize * 0.36)}px ${Math.round(fontSize * 0.82)}px`,
          borderRadius: 9999,
          backdropFilter: 'blur(8px)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.55)',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
          letterSpacing: '-0.01em',
          display: 'flex',
          alignItems: 'center',
          gap: `${Math.round(fontSize * 0.45)}px`,
          lineHeight: 1,
        }}
      >
        {/* Glowing orange/red-orange indicator dot */}
        <span
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: '50%',
            backgroundColor: '#FF4B26',
            boxShadow: '0 0 8px rgba(255, 75, 38, 0.9), 0 0 16px rgba(255, 75, 38, 0.5)',
            display: 'inline-block',
            flexShrink: 0,
          }}
        />
        <span>Made with getinstacap.com</span>
      </div>
    </AbsoluteFill>
  )
}

// Minimalist, high-end studio end screen
const OutroScreen: React.FC = () => {
  const frame = useCurrentFrame()
  const { durationInFrames, fps, width, height } = useVideoConfig()

  const outroDurationFrames = Math.round(fps * 1.5)
  const startFrame = durationInFrames - outroDurationFrames

  if (frame < startFrame) return null

  const opacity = interpolate(
    frame,
    [startFrame, startFrame + Math.round(fps * 0.35)],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  )

  const isPortrait = height > width
  const baseScale = isPortrait ? width : height
  const titleSize = Math.round(baseScale * 0.078)
  const labelSize = Math.round(titleSize * 0.35)
  const dotSize = Math.max(10, Math.round(titleSize * 0.22))

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#000000',
        opacity,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
        pointerEvents: 'none',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Refined eyebrow label */}
      <div
        style={{
          fontSize: labelSize,
          fontWeight: 600,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'rgba(255, 255, 255, 0.45)',
          marginBottom: Math.round(titleSize * 0.3),
        }}
      >
        Made with
      </div>

      {/* Clean, beautifully balanced website domain with glowing dot */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: Math.round(titleSize * 0.26),
          fontSize: titleSize,
          fontWeight: 800,
          letterSpacing: '-0.025em',
          lineHeight: 1,
        }}
      >
        <span
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: '50%',
            backgroundColor: '#FF4B26',
            boxShadow: '0 0 10px rgba(255, 75, 38, 0.95), 0 0 20px rgba(255, 75, 38, 0.5)',
            display: 'inline-block',
            flexShrink: 0,
          }}
        />
        <div>
          <span style={{ color: '#FFFFFF' }}>get</span>
          <span style={{ color: '#FF4B26' }}>Insta</span>
          <span style={{ color: '#FFFFFF' }}>cap.com</span>
        </div>
      </div>
    </AbsoluteFill>
  )
}

export const CaptionRoot: React.FC<CaptionRootProps> = ({ style, transcript, videoSrc, activeColor, textColor, accentColor, fontFamily, fontSizeMultiplier, posX, posY, watermark, newsHeadline, newsCategory }) => {
  const shared = { activeColor, textColor, fontFamily, fontSizeMultiplier, posX, posY }

  let composition: React.ReactNode
  if (style === 'Karaoke')      composition = <Karaoke      transcript={transcript} videoSrc={videoSrc} {...shared} />
  else if (style === 'Fade')         composition = <Fade         transcript={transcript} videoSrc={videoSrc} {...shared} />
  else if (style === 'Spring')       composition = <Spring       transcript={transcript} videoSrc={videoSrc} {...shared} />
  else if (style === 'Hype')         composition = <Hype         transcript={transcript} videoSrc={videoSrc} {...shared} />
  else if (style === 'Hormozi')      composition = <Hormozi      transcript={transcript} videoSrc={videoSrc} {...shared} />
  else if (style === 'Minimal')      composition = <Minimal      transcript={transcript} videoSrc={videoSrc} {...shared} />
  else if (style === 'BoxHighlight') composition = <BoxHighlight transcript={transcript} videoSrc={videoSrc} {...shared} accentColor={accentColor} />
  else if (style === 'Comic')        composition = <Comic        transcript={transcript} videoSrc={videoSrc} {...shared} />
  else if (style === 'Pill')         composition = <Pill         transcript={transcript} videoSrc={videoSrc} {...shared} />
  else if (style === 'Script')       composition = <Script       transcript={transcript} videoSrc={videoSrc} {...shared} />
  else if (style === 'SingleWord')   composition = <SingleWord   transcript={transcript} videoSrc={videoSrc} {...shared} />
  else if (style === 'Typewriter')   composition = <Typewriter   transcript={transcript} videoSrc={videoSrc} {...shared} />
  else if (style === 'NeonGlow')     composition = <NeonGlow     transcript={transcript} videoSrc={videoSrc} {...shared} />
  else if (style === 'CaptionBar')   composition = <CaptionBar   transcript={transcript} videoSrc={videoSrc} {...shared} />
  else if (style === 'Gradient')     composition = <Gradient     transcript={transcript} videoSrc={videoSrc} {...shared} />
  else if (style === 'Highlighter')  composition = <Highlighter  transcript={transcript} videoSrc={videoSrc} {...shared} />
  else if (style === 'Underline')    composition = <Underline    transcript={transcript} videoSrc={videoSrc} {...shared} />
  else if (style === 'Glide')        composition = <Glide        transcript={transcript} videoSrc={videoSrc} {...shared} />
  else if (style === 'Outline')      composition = <Outline      transcript={transcript} videoSrc={videoSrc} {...shared} />
  else if (style === 'Meme')         composition = <Meme         transcript={transcript} videoSrc={videoSrc} {...shared} />
  else if (style === 'Pulse')        composition = <Pulse        transcript={transcript} videoSrc={videoSrc} {...shared} />
  else if (style === 'Sticker')      composition = <Sticker      transcript={transcript} videoSrc={videoSrc} {...shared} />
  else if (style === 'Glitch')       composition = <Glitch       transcript={transcript} videoSrc={videoSrc} {...shared} />
  else if (style === 'Wave')         composition = <Wave         transcript={transcript} videoSrc={videoSrc} {...shared} />
  else if (style === 'Handwritten')  composition = <Handwritten  transcript={transcript} videoSrc={videoSrc} {...shared} />
  else if (style === 'NewsBar')      composition = <NewsBar      transcript={transcript} videoSrc={videoSrc} {...shared} newsHeadline={newsHeadline} newsCategory={newsCategory} />
  else if (style === 'WordHighlight') composition = <WordHighlight transcript={transcript} videoSrc={videoSrc} {...shared} />
  else if (style === 'KaraokeFill')   composition = <KaraokeFill transcript={transcript} videoSrc={videoSrc} {...shared} />
  else if (style === 'FocusCard')     composition = <FocusCard transcript={transcript} videoSrc={videoSrc} {...shared} />
  else if (style === 'ComicStrip')    composition = <ComicStrip transcript={transcript} videoSrc={videoSrc} {...shared} />
  else if (style === 'SoftCandy')     composition = <SoftCandy transcript={transcript} videoSrc={videoSrc} {...shared} />
  else if (style === 'RetroScript')   composition = <RetroScript transcript={transcript} videoSrc={videoSrc} {...shared} />
  else composition = <WordByWord transcript={transcript} videoSrc={videoSrc} {...shared} />

  return (
    <>
      {composition}
      {watermark && (
        <>
          <Watermark />
          <OutroScreen />
        </>
      )}
    </>
  )
}

