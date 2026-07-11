const ERROR_PATTERNS: { match: RegExp; message: string }[] = [
  { match: /no transcription results|silent or invalid/i, message: "We couldn't transcribe this video — check that it has clear audio." },
  { match: /transcri/i, message: "We couldn't transcribe this video. Try again or upload an .srt/.vtt instead." },
  { match: /no transcript/i, message: 'This video has no transcript yet — try re-uploading.' },
  { match: /redis|enqueue timeout/i, message: 'A temporary server issue interrupted this render. Try again.' },
  { match: /ENOSPC|disk/i, message: 'A temporary server issue interrupted this render. Try again.' },
  { match: /not found/i, message: 'This video could not be found — it may have been deleted.' },
]

const FALLBACK = 'Render failed. Try again or contact support.'

// Never show raw stack traces or SDK error objects to users — job.errorMessage
// in Mongo stays detailed for debugging, this is the UI-facing translation.
export function mapErrorMessage(raw: string | null | undefined): string {
  if (!raw) return FALLBACK
  return ERROR_PATTERNS.find((p) => p.match.test(raw))?.message ?? FALLBACK
}
