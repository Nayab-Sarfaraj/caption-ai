import React from 'react'
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
}

export const CaptionRoot: React.FC<CaptionRootProps> = ({ style, transcript, videoSrc, activeColor, textColor, accentColor, fontFamily, fontSizeMultiplier }) => {
  const shared = { activeColor, textColor, fontFamily, fontSizeMultiplier }
  if (style === 'Karaoke')      return <Karaoke      transcript={transcript} videoSrc={videoSrc} {...shared} />
  if (style === 'Fade')         return <Fade         transcript={transcript} videoSrc={videoSrc} {...shared} />
  if (style === 'Spring')       return <Spring       transcript={transcript} videoSrc={videoSrc} {...shared} />
  if (style === 'Hype')         return <Hype         transcript={transcript} videoSrc={videoSrc} {...shared} />
  if (style === 'Hormozi')      return <Hormozi      transcript={transcript} videoSrc={videoSrc} {...shared} />
  if (style === 'Minimal')      return <Minimal      transcript={transcript} videoSrc={videoSrc} {...shared} />
  if (style === 'BoxHighlight') return <BoxHighlight transcript={transcript} videoSrc={videoSrc} {...shared} accentColor={accentColor} />
  if (style === 'Comic')        return <Comic        transcript={transcript} videoSrc={videoSrc} {...shared} />
  if (style === 'Pill')         return <Pill         transcript={transcript} videoSrc={videoSrc} {...shared} />
  if (style === 'Script')       return <Script       transcript={transcript} videoSrc={videoSrc} {...shared} />
  return <WordByWord transcript={transcript} videoSrc={videoSrc} {...shared} />
}
