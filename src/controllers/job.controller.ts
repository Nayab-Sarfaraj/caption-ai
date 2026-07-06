import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { findJobById, findJobsByUserId } from '@/src/repositories/job.repository'
import { generatePresignedGet } from '@/src/helpers/presigned-url'

export async function handleGetJob(
  _req: NextRequest,
  jobId: string
): Promise<NextResponse> {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const job = await findJobById(jobId)
  if (!job || job.userId !== userId) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  let downloadUrl: string | null = null
  if (job.status === 'done' && job.outputKey) {
    downloadUrl = await generatePresignedGet(job.outputKey, 3600)
  }

  return NextResponse.json({
    id: job._id.toString(),
    status: job.status,
    originalFilename: job.originalFilename,
    transcriptSource: job.transcriptSource,
    errorMessage: job.errorMessage,
    createdAt: job.createdAt,
    downloadUrl,
  })
}

export async function handleListJobs(_req: NextRequest): Promise<NextResponse> {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const jobs = await findJobsByUserId(userId)
  return NextResponse.json(
    jobs.map((j) => ({
      id: j._id.toString(),
      status: j.status,
      originalFilename: j.originalFilename,
      transcriptSource: j.transcriptSource,
      createdAt: j.createdAt,
    }))
  )
}
