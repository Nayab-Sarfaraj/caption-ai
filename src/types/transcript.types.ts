export interface TranscriptWord {
  word: string
  start: number        // seconds (float)
  end: number          // seconds (float)
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
  words: TranscriptWord[]  // flat list — primary input for word-by-word rendering
}
