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
      smart_format: true,
      punctuate: true,
      diarize: false,
    })) as any

    const alternative = response?.results?.channels?.[0]?.alternatives?.[0]
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
      typeof response?.results?.channels?.[0]?.detected_language === 'string'
        ? response.results.channels[0].detected_language
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
  const CHUNK = 10
  const segments: TranscriptSegment[] = []
  for (let i = 0; i < words.length; i += CHUNK) {
    const chunk = words.slice(i, i + CHUNK)
    segments.push({
      text: chunk.map((w) => w.word).join(' '),
      start: chunk[0].start,
      end: chunk[chunk.length - 1].end,
      words: chunk,
    })
  }
  return segments
}

export function getTranscriptionProvider(): TranscriptionProvider {
  if (process.env.TRANSCRIPTION_PROVIDER === 'whisper') return new WhisperProvider()
  return new DeepgramProvider()
}
