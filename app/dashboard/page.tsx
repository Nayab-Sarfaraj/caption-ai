import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { connectDB } from '@/src/lib/mongo'
import { findJobsByUserId } from '@/src/repositories/job.repository'
import { UploadDropzone } from '@/components/upload-dropzone'
import Link from 'next/link'

const STATUS: Record<string, { dot: string; label: string }> = {
  done:             { dot: 'bg-green-400',  label: 'Done' },
  rendering:        { dot: 'bg-yellow-400', label: 'Rendering' },
  transcribing:     { dot: 'bg-yellow-400', label: 'Transcribing' },
  transcript_ready: { dot: 'bg-blue-400',   label: 'Preview ready' },
  processing:       { dot: 'bg-yellow-400', label: 'Processing' },
  pending:          { dot: 'bg-zinc-500',   label: 'Pending' },
  failed:           { dot: 'bg-red-400',    label: 'Failed' },
}

function timeAgo(date: Date): string {
  const s = Math.floor((Date.now() - date.getTime()) / 1000)
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  await connectDB()
  const jobs = await findJobsByUserId(userId)

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-10 sm:space-y-12">
      {/* Upload hero */}
      <section className="space-y-4">
        <div>
          <h1 className="text-lg font-semibold text-white">New video</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Upload and get word-by-word animated captions</p>
        </div>
        <UploadDropzone />
      </section>

      {/* Recent jobs */}
      {jobs.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-widest">Recent</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {jobs.map((job) => {
              const s = STATUS[job.status] ?? STATUS.pending
              const id = job._id.toString()
              return (
                <Link
                  key={id}
                  href={`/dashboard/jobs/${id}`}
                  className="group block rounded-lg border border-white/10 bg-[#111] overflow-hidden hover:border-white/20 transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="aspect-video bg-zinc-900 flex items-center justify-center">
                    <svg className="w-7 h-7 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.361a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"
                      />
                    </svg>
                  </div>
                  {/* Info */}
                  <div className="p-3 space-y-1.5">
                    <p className="text-sm text-white font-medium truncate">{job.originalFilename}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        <span className="text-xs text-zinc-400">{s.label}</span>
                      </div>
                      <span className="text-xs text-zinc-600">
                        {job.createdAt ? timeAgo(new Date(job.createdAt)) : ''}
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
