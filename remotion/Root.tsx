import React from 'react'
import { Composition, registerRoot } from 'remotion'
import { WordByWord } from './compositions/WordByWord'
import { Karaoke } from './compositions/Karaoke'
import { Fade } from './compositions/Fade'
import { Spring } from './compositions/Spring'
import { Hype } from './compositions/Hype'
import { Hormozi } from './compositions/Hormozi'
import { Minimal } from './compositions/Minimal'
import { CaptionRoot } from './compositions/CaptionRoot'
import { SAMPLE_TRANSCRIPT, SAMPLE_DURATION_FRAMES } from './sample-transcript'

const FPS = 30
const WIDTH = 1920
const HEIGHT = 1080

const RemotionRoot: React.FC = () => {
  const defaultProps = {
    transcript: SAMPLE_TRANSCRIPT,
    videoSrc: '',
    activeColor: '#FACC15',
    textColor: '#FFFFFF',
  }

  return (
    <>
      <Composition
        id="WordByWord"
        component={WordByWord}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        durationInFrames={SAMPLE_DURATION_FRAMES}
        defaultProps={defaultProps}
      />
      <Composition
        id="Karaoke"
        component={Karaoke}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        durationInFrames={SAMPLE_DURATION_FRAMES}
        defaultProps={defaultProps}
      />
      <Composition
        id="Fade"
        component={Fade}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        durationInFrames={SAMPLE_DURATION_FRAMES}
        defaultProps={defaultProps}
      />
      <Composition
        id="Spring"
        component={Spring}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        durationInFrames={SAMPLE_DURATION_FRAMES}
        defaultProps={defaultProps}
      />
      <Composition
        id="Hype"
        component={Hype}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        durationInFrames={SAMPLE_DURATION_FRAMES}
        defaultProps={defaultProps}
      />
      <Composition
        id="Hormozi"
        component={Hormozi}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        durationInFrames={SAMPLE_DURATION_FRAMES}
        defaultProps={defaultProps}
      />
      <Composition
        id="Minimal"
        component={Minimal}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        durationInFrames={SAMPLE_DURATION_FRAMES}
        defaultProps={defaultProps}
      />
      <Composition
        id="CaptionRoot"
        component={CaptionRoot}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        durationInFrames={SAMPLE_DURATION_FRAMES}
        defaultProps={{ style: 'WordByWord' as const, ...defaultProps }}
      />
    </>
  )
}

registerRoot(RemotionRoot)
