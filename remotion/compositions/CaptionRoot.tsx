import React from 'react'
import { WordByWord } from './WordByWord'
import { Karaoke } from './Karaoke'
import { Fade } from './Fade'
import { Spring } from './Spring'
import { Hype } from './Hype'
import { Hormozi } from './Hormozi'
import { Minimal } from './Minimal'
import type { Transcript } from '../types'

export type CompositionId = 'WordByWord' | 'Karaoke' | 'Fade' | 'Spring' | 'Hype' | 'Hormozi' | 'Minimal'

export interface CaptionRootProps {
  style: CompositionId
  transcript: Transcript
  videoSrc: string
  activeColor?: string
  textColor?: string
  fontFamily?: string
  fontSizeMultiplier?: number
}

export const CaptionRoot: React.FC<CaptionRootProps> = ({ style, transcript, videoSrc, activeColor, textColor, fontFamily, fontSizeMultiplier }) => {
  const shared = { activeColor, textColor, fontFamily, fontSizeMultiplier }
  if (style === 'Karaoke')  return <Karaoke  transcript={transcript} videoSrc={videoSrc} {...shared} />
  if (style === 'Fade')     return <Fade     transcript={transcript} videoSrc={videoSrc} {...shared} />
  if (style === 'Spring')   return <Spring   transcript={transcript} videoSrc={videoSrc} {...shared} />
  if (style === 'Hype')     return <Hype     transcript={transcript} videoSrc={videoSrc} {...shared} />
  if (style === 'Hormozi')  return <Hormozi  transcript={transcript} videoSrc={videoSrc} {...shared} />
  if (style === 'Minimal')  return <Minimal  transcript={transcript} videoSrc={videoSrc} {...shared} />
  return <WordByWord transcript={transcript} videoSrc={videoSrc} {...shared} />
}
