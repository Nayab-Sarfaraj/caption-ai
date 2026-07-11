import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { connectDB } from '@/src/lib/mongo'
import { findJobById } from '@/src/repositories/job.repository'
import { generatePresignedGet } from '@/src/helpers/presigned-url'
import { JobProgress } from '@/components/job-progress'
import { DownloadButton } from '@/components/download-button'
import { PreviewPlayer } from '@/components/preview-player-wrapper'
import { RetryButton } from '@/components/retry-button'
import { mapErrorMessage } from '@/src/helpers/error-messages'
import type { Transcript } from '@/src/types/transcript.types'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

const STATUS: Record<string, { color: string; label: string }> = {
  done:             { color: '#2e7d4f', label: 'DONE' },
  rendering:        { color: '#b8860b', label: 'RENDERING…' },
  transcribing:     { color: '#b8860b', label: 'TRANSCRIBING…' },
  transcript_ready: { color: '#1e5f8c', label: 'READY' },
  processing:       { color: '#b8860b', label: 'PROCESSING…' },
  pending:          { color: '#a39e96', label: 'PENDING' },
  failed:           { color: '#c1361f', label: 'FAILED' },
}

const FPS = 30

export default async function JobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  await connectDB()
  const job = await findJobById(id)
  if (!job || job.userId !== userId) redirect('/dashboard')

  const s = STATUS[job.status] ?? STATUS.pending
  const isProcessing = ['pending', 'processing', 'transcribing'].includes(job.status)
  const isRendering  = job.status === 'rendering'
  const isReady      = job.status === 'transcript_ready'
  const isDone       = job.status === 'done'
  const isFailed     = job.status === 'failed'

  // Presigned URL for original video (preview) — only needed when transcript_ready
  let videoSrc: string | null = null
  if (isReady && job.videoKey) {
    videoSrc = await generatePresignedGet(job.videoKey, 3600)
  }

  // Presigned URL for rendered output (playback + download)
  let outputUrl: string | null = null
  if (isDone && job.outputKey) {
    outputUrl = await generatePresignedGet(job.outputKey, 3600)
  }

  // Compute duration from transcript for the Player
  const transcript = job.transcript as Transcript | null
  const durationInFrames = transcript?.words?.length
    ? Math.ceil(transcript.words[transcript.words.length - 1].end * FPS) + FPS * 3
    : FPS * 60 // 60s fallback

  const videoWidth = job.width ?? 1920
  const videoHeight = job.height ?? 1080

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-8 space-y-5 min-h-full font-[family-name:var(--font-cc)]">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-[#6b6862] hover:text-[#1a1917] transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back
      </Link>

      {isReady && videoSrc && transcript ? (
        <PreviewPlayer
          jobId={id}
          videoSrc={videoSrc}
          transcript={transcript}
          durationInFrames={durationInFrames}
          width={videoWidth}
          height={videoHeight}
          filename={job.originalFilename}
          statusLabel={s.label}
          statusColor={s.color}
          transcriptSource={job.transcriptSource ?? undefined}
          createdAt={job.createdAt ? new Date(job.createdAt).toLocaleString() : undefined}
        />
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5 items-start">
        {/* Left: video or status placeholder */}
          <div>
            {isDone && outputUrl ? (
              <div className="border border-[#14120f1f] bg-black overflow-hidden">
                <video
                  src={outputUrl}
                  controls
                  className="w-full aspect-video object-contain bg-black"
                />
              </div>
            ) : (
              <div className="border border-[#14120f1f] bg-black overflow-hidden">
                <div className="aspect-video flex flex-col items-center justify-center gap-3">
                  {(isProcessing || isRendering) && (
                    <div className="flex gap-1.5">
                      {[0, 0.15, 0.3].map((d) => (
                        <span
                          key={d}
                          className="w-1.5 h-1.5 animate-bounce"
                          style={{ backgroundColor: '#b8860b', animationDelay: `${d}s` }}
                        />
                      ))}
                    </div>
                  )}
                  <p className="text-sm font-bold" style={{ color: s.color }}>{s.label}</p>
                  {isFailed && (
                    <p className="text-xs text-white/60 max-w-xs text-center px-4">{mapErrorMessage(job.errorMessage)}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right: info panel */}
          <div className="border border-[#14120f1f] bg-white p-5 space-y-5">
            <div className="space-y-2">
              <h1 className="text-sm font-bold text-[#1a1917] truncate">{job.originalFilename}</h1>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                <span className="text-sm" style={{ color: s.color }}>{s.label}</span>
              </div>
            </div>

            <div className="border-t border-[#14120f1f]" />

            <div className="space-y-3 text-sm">
              {job.transcriptSource && (
                <div className="flex items-center justify-between">
                  <span className="text-[#a39e96]">Transcript</span>
                  <span className="text-[#6b6862] text-xs">
                    {job.transcriptSource === 'user' ? 'Uploaded SRT/VTT' : 'AI · Deepgram'}
                  </span>
                </div>
              )}
              {job.createdAt && (
                <div className="flex items-center justify-between">
                  <span className="text-[#a39e96]">Created</span>
                  <span className="text-[#6b6862] text-xs">
                    {new Date(job.createdAt).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {(isProcessing || isRendering) && (
              <JobProgress jobId={id} initialStatus={job.status} />
            )}

            {isDone && (
              <DownloadButton jobId={id} filename={`captioned-${job.originalFilename}`} />
            )}

            {isFailed && (
              <RetryButton jobId={id} manualRetryCount={job.manualRetryCount} />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
