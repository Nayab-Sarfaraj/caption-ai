import React from 'react'
import { WordByWord } from './WordByWord'
import { Karaoke } from './Karaoke'
import { Fade } from './Fade'
import { Spring } from './Spring'
import type { Transcript } from '../types'

export type CompositionId = 'WordByWord' | 'Karaoke' | 'Fade' | 'Spring'

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
  if (style === 'Karaoke') return <Karaoke transcript={transcript} videoSrc={videoSrc} {...shared} />
  if (style === 'Fade')    return <Fade    transcript={transcript} videoSrc={videoSrc} {...shared} />
  if (style === 'Spring')  return <Spring  transcript={transcript} videoSrc={videoSrc} {...shared} />
  return <WordByWord transcript={transcript} videoSrc={videoSrc} {...shared} />
}
