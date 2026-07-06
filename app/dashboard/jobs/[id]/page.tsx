import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { connectDB } from '@/src/lib/mongo'
import { findJobById } from '@/src/repositories/job.repository'
import { generatePresignedGet } from '@/src/helpers/presigned-url'
import { JobProgress } from '@/components/job-progress'
import { DownloadButton } from '@/components/download-button'
import { PreviewPlayer } from '@/components/preview-player-wrapper'
import type { Transcript } from '@/src/types/transcript.types'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

const STATUS: Record<string, { dot: string; label: string; text: string }> = {
  done:             { dot: 'bg-green-400',  label: 'Done',           text: 'text-green-400' },
  rendering:        { dot: 'bg-yellow-400', label: 'Rendering…',    text: 'text-yellow-400' },
  transcribing:     { dot: 'bg-yellow-400', label: 'Transcribing…', text: 'text-yellow-400' },
  transcript_ready: { dot: 'bg-blue-400',   label: 'Ready',          text: 'text-blue-400' },
  processing:       { dot: 'bg-yellow-400', label: 'Processing…',   text: 'text-yellow-400' },
  pending:          { dot: 'bg-zinc-500',   label: 'Pending',        text: 'text-zinc-400' },
  failed:           { dot: 'bg-red-400',    label: 'Failed',         text: 'text-red-400' },
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
    <div className="px-4 sm:px-6 py-6 sm:py-8 space-y-5 min-h-full">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-white transition-colors"
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
          statusDot={s.dot}
          statusText={s.text}
          transcriptSource={job.transcriptSource}
          createdAt={job.createdAt ? new Date(job.createdAt).toLocaleString() : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5 items-start">
          {/* Left: video or status placeholder */}
          <div>
            {isDone && outputUrl ? (
              <div className="rounded-xl border border-white/10 bg-[#111] overflow-hidden">
                <video
                  src={outputUrl}
                  controls
                  className="w-full aspect-video object-contain bg-black"
                />
              </div>
            ) : (
              <div className="rounded-xl border border-white/10 bg-[#111] overflow-hidden">
                <div className="aspect-video bg-zinc-900 flex flex-col items-center justify-center gap-3">
                  {(isProcessing || isRendering) && (
                    <div className="flex gap-1.5">
                      {[0, 0.15, 0.3].map((d) => (
                        <span
                          key={d}
                          className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-bounce"
                          style={{ animationDelay: `${d}s` }}
                        />
                      ))}
                    </div>
                  )}
                  <p className={`text-sm font-medium ${s.text}`}>{s.label}</p>
                  {isFailed && job.errorMessage && (
                    <p className="text-xs text-zinc-500 max-w-xs text-center px-4">{job.errorMessage}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right: info panel */}
          <div className="rounded-xl border border-white/10 bg-[#111] p-5 space-y-5">
            <div className="space-y-2">
              <h1 className="text-sm font-semibold text-white truncate">{job.originalFilename}</h1>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full shrink-0 ${s.dot}`} />
                <span className={`text-sm ${s.text}`}>{s.label}</span>
              </div>
            </div>

            <div className="border-t border-white/10" />

            <div className="space-y-3 text-sm">
              {job.transcriptSource && (
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Transcript</span>
                  <span className="text-zinc-300 text-xs">
                    {job.transcriptSource === 'user' ? 'Uploaded SRT/VTT' : 'AI · Deepgram'}
                  </span>
                </div>
              )}
              {job.createdAt && (
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Created</span>
                  <span className="text-zinc-300 text-xs">
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
          </div>
        </div>
      )}
    </div>
  )
}
