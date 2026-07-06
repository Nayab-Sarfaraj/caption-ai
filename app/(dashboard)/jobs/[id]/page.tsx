import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { findJobById } from '@/src/repositories/job.repository'
import { connectDB } from '@/src/lib/mongo'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { JobProgress } from '@/components/job-progress'
import { DownloadButton } from '@/components/download-button'
import Link from 'next/link'

const STATUS_COLORS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  processing: 'default',
  transcribing: 'default',
  rendering: 'default',
  done: 'default',
  failed: 'destructive',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  processing: 'Processing',
  transcribing: 'Transcribing',
  rendering: 'Rendering',
  done: 'Done',
  failed: 'Failed',
}

export default async function JobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  await connectDB()
  const job = await findJobById(id)

  if (!job || job.userId !== userId) {
    redirect('/dashboard')
  }

  const isActive = ['pending', 'processing', 'transcribing', 'rendering'].includes(job.status)

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="outline" size="sm">← Back</Button>
        </Link>
        <h1 className="text-xl font-bold truncate">{job.originalFilename}</h1>
      </div>

      <div className="rounded-xl border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status</span>
          <Badge variant={STATUS_COLORS[job.status] ?? 'secondary'}>
            {STATUS_LABELS[job.status] ?? job.status}
          </Badge>
        </div>

        {job.transcriptSource && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Transcript source</span>
            <Badge variant="outline">
              {job.transcriptSource === 'user' ? 'Uploaded SRT/VTT' : 'AI (Deepgram)'}
            </Badge>
          </div>
        )}

        {job.createdAt && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Created</span>
            <span className="text-sm">{new Date(job.createdAt).toLocaleString()}</span>
          </div>
        )}

        {job.status === 'failed' && job.errorMessage && (
          <div className="rounded-md bg-destructive/10 p-3">
            <p className="text-sm text-destructive">{job.errorMessage}</p>
          </div>
        )}

        {isActive && (
          <JobProgress
            jobId={id}
            initialStatus={job.status}
          />
        )}

        {job.status === 'done' && (
          <DownloadButton
            jobId={id}
            filename={`captioned-${job.originalFilename}`}
          />
        )}

        {job.status === 'pending' && (
          <p className="text-sm text-muted-foreground">
            Waiting in queue… this page will update automatically when rendering starts.
          </p>
        )}
      </div>
    </main>
  )
}
