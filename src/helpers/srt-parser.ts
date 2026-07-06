import type { Transcript, TranscriptSegment, TranscriptWord } from '@/src/types/transcript.types'

function parseSrtTimestamp(ts: string): number {
  // Format: HH:MM:SS,mmm
  const [time, ms] = ts.split(',')
  const [h, m, s] = time.split(':').map(Number)
  return h * 3600 + m * 60 + s + Number(ms) / 1000
}

function parseVttTimestamp(ts: string): number {
  // Format: HH:MM:SS.mmm or MM:SS.mmm
  const parts = ts.split(':')
  if (parts.length === 3) {
    return Number(parts[0]) * 3600 + Number(parts[1]) * 60 + parseFloat(parts[2])
  }
  return Number(parts[0]) * 60 + parseFloat(parts[1])
}

export function parseCaptionFile(content: string, format: 'srt' | 'vtt'): Transcript {
  const segments: TranscriptSegment[] = []
  const words: TranscriptWord[] = []

  if (format === 'srt') {
    const blocks = content.trim().split(/\n\s*\n/)
    for (const block of blocks) {
      const lines = block.trim().split('\n')
      if (lines.length < 3) continue

      // lines[0] = sequence number, lines[1] = timecodes, lines[2+] = text
      const match = lines[1].match(
        /(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/
      )
      if (!match) continue

      const start = parseSrtTimestamp(match[1])
      const end = parseSrtTimestamp(match[2])
      const text = lines.slice(2).join(' ').trim()
      if (!text) continue

      // SRT has no word-level timing — treat full line as one entry
      const word: TranscriptWord = { word: text, start, end }
      segments.push({ text, start, end, words: [word] })
      words.push(word)
    }
  } else {
    // VTT
    const lines = content.trim().split('\n')
    let i = 0

    // Skip WEBVTT header and metadata
    while (i < lines.length && !lines[i].includes('-->')) i++

    while (i < lines.length) {
      if (!lines[i].includes('-->')) { i++; continue }

      const match = lines[i].match(/([\d:.]+)\s*-->\s*([\d:.]+)/)
      if (!match) { i++; continue }

      const start = parseVttTimestamp(match[1])
      const end = parseVttTimestamp(match[2])
      i++

      const textLines: string[] = []
      while (i < lines.length && lines[i].trim() !== '') {
        textLines.push(lines[i])
        i++
      }

      // Strip inline cue tags (<c>, timestamps, etc.)
      const text = textLines.join(' ').replace(/<[^>]+>/g, '').trim()
      if (!text) continue

      const word: TranscriptWord = { word: text, start, end }
      segments.push({ text, start, end, words: [word] })
      words.push(word)
    }
  }

  return { source: 'user', segments, words }
}
