import type { Transcript, TranscriptSegment, TranscriptWord } from '../types'

export function getActiveCaptionWords(
  transcript: Transcript,
  currentTime: number,
  chunkSize = 5,
): { currentSegment?: TranscriptSegment; visibleWords: TranscriptWord[] } {
  const currentSegment = transcript.segments.find(
    (segment) => currentTime >= segment.start && currentTime < segment.end,
  )

  if (!currentSegment) return { visibleWords: [] }

  const currentWordIdx = currentSegment.words.findIndex(
    (word) => currentTime >= word.start && currentTime < word.end,
  )
  const activeIdx = currentWordIdx >= 0
    ? currentWordIdx
    : currentSegment.words.reduce(
        (lastStartedIndex, word, index) =>
          currentTime >= word.start ? index : lastStartedIndex,
        0,
      )
  const chunkStart = Math.floor(activeIdx / chunkSize) * chunkSize

  return {
    currentSegment,
    visibleWords: currentSegment.words.slice(chunkStart, chunkStart + chunkSize),
  }
}
