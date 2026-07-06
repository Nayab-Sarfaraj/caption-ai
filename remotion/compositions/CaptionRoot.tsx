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
}

// Single wrapper composition — swap `style` via inputProps without remounting.
// The Player component reference stays stable; only inputProps change.
export const CaptionRoot: React.FC<CaptionRootProps> = ({ style, transcript, videoSrc, activeColor, textColor }) => {
  const colors = { activeColor, textColor }
  if (style === 'Karaoke') return <Karaoke transcript={transcript} videoSrc={videoSrc} {...colors} />
  if (style === 'Fade')    return <Fade    transcript={transcript} videoSrc={videoSrc} {...colors} />
  if (style === 'Spring')  return <Spring  transcript={transcript} videoSrc={videoSrc} {...colors} />
  return <WordByWord transcript={transcript} videoSrc={videoSrc} {...colors} />
}
