import type { Transcript } from './types'

export const SAMPLE_TRANSCRIPT: Transcript = {
  source: 'deepgram',
  language: 'en',
  words: [
    { word: 'The', start: 0.0, end: 0.2, confidence: 0.99 },
    { word: 'quick', start: 0.2, end: 0.5, confidence: 0.99 },
    { word: 'brown', start: 0.5, end: 0.8, confidence: 0.98 },
    { word: 'fox', start: 0.8, end: 1.1, confidence: 0.99 },
    { word: 'jumps', start: 1.2, end: 1.6, confidence: 0.99 },
    { word: 'over', start: 1.6, end: 1.9, confidence: 0.98 },
    { word: 'the', start: 1.9, end: 2.1, confidence: 0.99 },
    { word: 'lazy', start: 2.1, end: 2.5, confidence: 0.99 },
    { word: 'dog.', start: 2.5, end: 3.0, confidence: 0.99 },
    { word: 'Pack', start: 3.2, end: 3.5, confidence: 0.99 },
    { word: 'my', start: 3.5, end: 3.7, confidence: 0.99 },
    { word: 'box', start: 3.7, end: 4.0, confidence: 0.98 },
    { word: 'with', start: 4.0, end: 4.2, confidence: 0.99 },
    { word: 'five', start: 4.2, end: 4.5, confidence: 0.99 },
    { word: 'dozen', start: 4.5, end: 4.9, confidence: 0.98 },
    { word: 'liquor', start: 4.9, end: 5.3, confidence: 0.99 },
    { word: 'jugs.', start: 5.3, end: 5.8, confidence: 0.99 },
  ],
  segments: [
    {
      text: 'The quick brown fox jumps over the lazy dog.',
      start: 0.0,
      end: 3.0,
      words: [],
    },
    {
      text: 'Pack my box with five dozen liquor jugs.',
      start: 3.2,
      end: 5.8,
      words: [],
    },
  ],
}

export const SAMPLE_DURATION_FRAMES = Math.ceil(6 * 30) // 6s at 30fps
