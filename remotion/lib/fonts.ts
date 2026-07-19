import { loadFont } from '@remotion/google-fonts/NotoSansDevanagari'

// Every caption style's font is Latin-only (Google Fonts subset or system-ui).
// Chromium can't substitute glyphs it doesn't have, so Devanagari (Hindi)
// words render as tofu boxes unless a font covering that script is appended
// to the fallback chain. Browsers resolve font-family per-character, so this
// works alongside any primary display font without changing its look for
// Latin text.
const { fontFamily: NOTO_SANS_DEVANAGARI } = loadFont('normal', {
  weights: ['500', '700'],
  subsets: ['devanagari'],
})

export function withScriptFallback(fontFamily: string): string {
  return `${fontFamily}, ${NOTO_SANS_DEVANAGARI}, system-ui, sans-serif`
}
