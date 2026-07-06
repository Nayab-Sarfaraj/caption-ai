// Duplicated from src/types/transcript.types.ts
// Remotion bundler runs independently — cannot safely import from ../src/
export interface TranscriptWord {
  word: string
  start: number
  end: number
  confidence?: number
}

export interface TranscriptSegment {
  text: string
  start: number
  end: number
  words: TranscriptWord[]
}

export interface Transcript {
  source: 'deepgram' | 'user'
  language?: string
  segments: TranscriptSegment[]
  words: TranscriptWord[]
}
