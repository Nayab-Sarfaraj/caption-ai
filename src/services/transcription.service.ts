import type { Transcript, TranscriptWord, TranscriptSegment } from '@/src/types/transcript.types'
import type { DeepgramClient as DeepgramClientType } from '@deepgram/sdk'

export interface TranscriptionProvider {
  transcribe(audioUrl: string): Promise<Transcript>
}

class DeepgramProvider implements TranscriptionProvider {
  async transcribe(audioUrl: string): Promise<Transcript> {
    const { DeepgramClient } = await import('@deepgram/sdk')
    const apiKey = process.env.DEEPGRAM_API_KEY
    if (!apiKey) throw new Error('DEEPGRAM_API_KEY not set')

    const client: DeepgramClientType = new DeepgramClient({ apiKey })

    // HttpResponsePromise<MediaTranscribeResponse> — awaits to ListenV1Response directly
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = (await client.listen.v1.media.transcribeUrl({
      url: audioUrl,
      model: 'nova-3',
      // 'multi' enables real code-switching (Hinglish etc.) — Nova-2 transcribes
      // each language fine but can't follow a switch mid-sentence; Nova-3 was
      // trained specifically on code-switching data. ~19% pricier than
      // monolingual Nova-3 ($0.0092/min vs $0.0077/min PAYG) but required for
      // mixed-language speech to come out right at all.
      language: 'multi',
      smart_format: true,
      punctuate: true,
      diarize: false,
    })) as any

    // v5 SDK wraps response as { data, rawResponse }
    const result = response?.data ?? response
    const alternative = result?.results?.channels?.[0]?.alternatives?.[0]
    if (!alternative?.words?.length) {
      throw new Error('No transcription results — audio may be silent or invalid')
    }

    const words: TranscriptWord[] = alternative.words.map((w: Record<string, unknown>) => ({
      word: String(w.punctuated_word ?? w.word ?? ''),
      start: Number(w.start),
      end: Number(w.end),
      confidence: w.confidence != null ? Number(w.confidence) : undefined,
    }))

    const language: string | undefined =
      typeof result?.results?.channels?.[0]?.detected_language === 'string'
        ? result.results.channels[0].detected_language
        : undefined

    return { source: 'deepgram', language, segments: buildSegments(words), words }
  }
}

class WhisperProvider implements TranscriptionProvider {
  async transcribe(_audioUrl: string): Promise<Transcript> {
    throw new Error('Whisper provider not implemented — set TRANSCRIPTION_PROVIDER=deepgram')
  }
}

function buildSegments(words: TranscriptWord[]): TranscriptSegment[] {
  const MAX_WORDS = 4
  const PAUSE_THRESHOLD = 0.35 // seconds — natural speech pause
  const segments: TranscriptSegment[] = []
  let current: TranscriptWord[] = []

  for (let i = 0; i < words.length; i++) {
    current.push(words[i])
    const next = words[i + 1]
    const pauseAfter = next ? next.start - words[i].end : Infinity
    const atMax = current.length >= MAX_WORDS
    const shouldFlush = atMax || pauseAfter >= PAUSE_THRESHOLD || !next

    if (shouldFlush) {
      // On max-word split (no natural pause) extend end to next segment start — no blank flash
      const end =
        atMax && next && pauseAfter < PAUSE_THRESHOLD
          ? next.start
          : current[current.length - 1].end

      segments.push({
        text: current.map((w) => w.word).join(' '),
        start: current[0].start,
        end,
        words: [...current],
      })
      current = []
    }
  }

  return segments
}

export function getTranscriptionProvider(): TranscriptionProvider {
  if (process.env.TRANSCRIPTION_PROVIDER === 'whisper') return new WhisperProvider()
  return new DeepgramProvider()
}
