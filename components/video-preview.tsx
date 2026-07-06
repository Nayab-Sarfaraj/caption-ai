'use client'

import dynamic from 'next/dynamic'
import type { Transcript } from '@/src/types/transcript.types'
import { WordByWord } from '@/remotion/compositions/WordByWord'
import { Karaoke } from '@/remotion/compositions/Karaoke'
import { Fade } from '@/remotion/compositions/Fade'
import { Spring } from '@/remotion/compositions/Spring'

const Player = dynamic(() => import('@remotion/player').then((m) => m.Player), { ssr: false })

const COMPOSITIONS = {
  WordByWord,
  Karaoke,
  Fade,
  Spring,
} as const

export type CompositionId = keyof typeof COMPOSITIONS

interface VideoPreviewProps {
  compositionId: CompositionId
  transcript: Transcript
  videoSrc?: string
}

export function VideoPreview({ compositionId, transcript, videoSrc = '' }: VideoPreviewProps) {
  const component = COMPOSITIONS[compositionId]
  const durationInFrames = Math.ceil(
    (transcript.words.at(-1)?.end ?? 5) * 30
  ) + 30

  return (
    <Player
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      component={component as any}
      inputProps={{ transcript, videoSrc }}
      durationInFrames={durationInFrames}
      fps={30}
      compositionWidth={1920}
      compositionHeight={1080}
      style={{ width: '100%', borderRadius: 12 }}
      controls
    />
  )
}
