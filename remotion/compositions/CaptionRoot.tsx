import React from 'react'
import { AbsoluteFill, useVideoConfig } from 'remotion'
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
import type { Transcript } from '../types'

export type CompositionId = 'WordByWord' | 'Karaoke' | 'Fade' | 'Spring' | 'Hype' | 'Hormozi' | 'Minimal' | 'BoxHighlight' | 'Comic' | 'Pill' | 'Script'

export interface CaptionRootProps {
  style: CompositionId
  transcript: Transcript
  videoSrc: string
  activeColor?: string
  textColor?: string
  accentColor?: string
  fontFamily?: string
  fontSizeMultiplier?: number
  watermark?: boolean
}

// One overlay here covers all 11 styles — cheaper and less drift-prone than
// adding a watermark prop to every composition file individually.
const Watermark: React.FC = () => {
  const { width } = useVideoConfig()
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          bottom: '3%',
          right: '3%',
          fontSize: Math.round(width / 42),
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontWeight: 700,
          color: 'rgba(255,255,255,0.55)',
          textShadow: '0 1px 3px rgba(0,0,0,0.65)',
          letterSpacing: '0.01em',
        }}
      >
        Made with Instacap
      </div>
    </AbsoluteFill>
  )
}

export const CaptionRoot: React.FC<CaptionRootProps> = ({ style, transcript, videoSrc, activeColor, textColor, accentColor, fontFamily, fontSizeMultiplier, watermark }) => {
  const shared = { activeColor, textColor, fontFamily, fontSizeMultiplier }

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
  else composition = <WordByWord transcript={transcript} videoSrc={videoSrc} {...shared} />

  return (
    <>
      {composition}
      {watermark && <Watermark />}
    </>
  )
}
