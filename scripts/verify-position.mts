// Verifies caption position control end-to-end through the REAL render path
// (getBundle → selectComposition → renderStill). Renders one caption at two
// posY values so we can eyeball that the transform actually moves it.
// Run from project root:  npx tsx scripts/verify-position.mts
import path from 'path'
import { getBundle } from '../src/services/render.service'
import type { Transcript } from '../remotion/types'

const transcript: Transcript = {
  source: 'user',
  language: 'en',
  words: [
    { word: 'STOP', start: 0.0, end: 0.4 },
    { word: 'THE', start: 0.4, end: 0.7 },
    { word: 'SCROLL', start: 0.7, end: 1.2 },
  ],
  segments: [
    {
      text: 'STOP THE SCROLL',
      start: 0.0,
      end: 1.2,
      words: [
        { word: 'STOP', start: 0.0, end: 0.4 },
        { word: 'THE', start: 0.4, end: 0.7 },
        { word: 'SCROLL', start: 0.7, end: 1.2 },
      ],
    },
  ],
}

const OUT = path.resolve(process.cwd(), 'scripts/.position-check')

async function main() {
  const { selectComposition, renderStill } = await import('@remotion/renderer')
  const serveUrl = await getBundle()
  const fs = await import('fs')
  fs.mkdirSync(OUT, { recursive: true })

  for (const posY of [15, 85]) {
    const inputProps = { style: 'Hormozi', transcript, videoSrc: '', posX: 50, posY }
    const composition = await selectComposition({ serveUrl, id: 'CaptionRoot', inputProps })
    composition.width = 1080
    composition.height = 1920
    await renderStill({
      composition,
      serveUrl,
      output: path.join(OUT, `posY-${posY}.png`),
      // frame ~1s in — "SCROLL" is active
      frame: 30,
      inputProps,
      chromiumOptions: { gl: 'swangle' },
    })
    console.log(`rendered posY=${posY}`)
  }
  console.log('done →', OUT)
}

main().catch((e) => { console.error(e); process.exit(1) })
