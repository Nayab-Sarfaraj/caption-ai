import React from 'react'
import { Composition, registerRoot } from 'remotion'
import { WordByWord } from './compositions/WordByWord'
import { Karaoke } from './compositions/Karaoke'
import { Fade } from './compositions/Fade'
import { Spring } from './compositions/Spring'
import { Hype } from './compositions/Hype'
import { Hormozi } from './compositions/Hormozi'
import { Minimal } from './compositions/Minimal'
import { BoxHighlight } from './compositions/BoxHighlight'
import { Comic } from './compositions/Comic'
import { Pill } from './compositions/Pill'
import { Script } from './compositions/Script'
import { SingleWord } from './compositions/SingleWord'
import { Typewriter } from './compositions/Typewriter'
import { NeonGlow } from './compositions/NeonGlow'
import { CaptionBar } from './compositions/CaptionBar'
import { Gradient } from './compositions/Gradient'
import { Highlighter } from './compositions/Highlighter'
import { Underline } from './compositions/Underline'
import { Glide } from './compositions/Glide'
import { Outline } from './compositions/Outline'
import { Meme } from './compositions/Meme'
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
        defaultProps={{ ...defaultProps, activeColor: '#22C55E' }}
      />
      <Composition
        id="Hormozi"
        component={Hormozi}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        durationInFrames={SAMPLE_DURATION_FRAMES}
        defaultProps={{ ...defaultProps, activeColor: '#F7C204' }}
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
        id="BoxHighlight"
        component={BoxHighlight}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        durationInFrames={SAMPLE_DURATION_FRAMES}
        defaultProps={{ ...defaultProps, activeColor: '#7C3AED', accentColor: '#A3E635' }}
      />
      <Composition
        id="Comic"
        component={Comic}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        durationInFrames={SAMPLE_DURATION_FRAMES}
        defaultProps={{ ...defaultProps, activeColor: '#38BDF8' }}
      />
      <Composition
        id="Pill"
        component={Pill}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        durationInFrames={SAMPLE_DURATION_FRAMES}
        defaultProps={{ ...defaultProps, activeColor: '#1F2937' }}
      />
      <Composition
        id="Script"
        component={Script}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        durationInFrames={SAMPLE_DURATION_FRAMES}
        defaultProps={{ ...defaultProps, activeColor: '#FBBF24' }}
      />
      <Composition
        id="SingleWord"
        component={SingleWord}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        durationInFrames={SAMPLE_DURATION_FRAMES}
        defaultProps={defaultProps}
      />
      <Composition
        id="Typewriter"
        component={Typewriter}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        durationInFrames={SAMPLE_DURATION_FRAMES}
        defaultProps={defaultProps}
      />
      <Composition
        id="NeonGlow"
        component={NeonGlow}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        durationInFrames={SAMPLE_DURATION_FRAMES}
        defaultProps={{ ...defaultProps, activeColor: '#22D3EE' }}
      />
      <Composition
        id="CaptionBar"
        component={CaptionBar}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        durationInFrames={SAMPLE_DURATION_FRAMES}
        defaultProps={defaultProps}
      />
      <Composition
        id="Gradient"
        component={Gradient}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        durationInFrames={SAMPLE_DURATION_FRAMES}
        defaultProps={{ ...defaultProps, activeColor: '#A855F7', textColor: '#F9A8D4' }}
      />
      <Composition
        id="Highlighter"
        component={Highlighter}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        durationInFrames={SAMPLE_DURATION_FRAMES}
        defaultProps={{ ...defaultProps, activeColor: '#FDE047' }}
      />
      <Composition
        id="Underline"
        component={Underline}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        durationInFrames={SAMPLE_DURATION_FRAMES}
        defaultProps={{ ...defaultProps, activeColor: '#38BDF8' }}
      />
      <Composition
        id="Glide"
        component={Glide}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        durationInFrames={SAMPLE_DURATION_FRAMES}
        defaultProps={defaultProps}
      />
      <Composition
        id="Outline"
        component={Outline}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        durationInFrames={SAMPLE_DURATION_FRAMES}
        defaultProps={defaultProps}
      />
      <Composition
        id="Meme"
        component={Meme}
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
