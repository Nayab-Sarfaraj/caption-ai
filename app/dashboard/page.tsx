import { Suspense } from 'react'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { findJobsByUserId } from '@/src/repositories/job.repository'
import { findByClerkId } from '@/src/repositories/user.repository'
import { getRendersRemaining } from '@/src/services/billing.service'
import { UploadDropzone } from '@/components/upload-dropzone'
import { JobsGrid } from '@/components/jobs-table'
import { Skeleton } from '@/components/skeleton'
import Link from 'next/link'

const RECENT_COUNT = 4

async function RecentJobs({ userId }: { userId: string }) {
  const { jobs, total } = await findJobsByUserId(userId, { page: 1, pageSize: RECENT_COUNT })

  if (jobs.length === 0) {
    return (
      <p className="mt-12 text-sm text-[var(--mute)] text-center">
        Your rendered videos will show up here.
      </p>
    )
  }

  return (
    <section className="mt-10">
      <div className="flex items-baseline justify-between mb-3">
        <p className="text-[11px] tracking-[0.15em] uppercase text-[var(--mute)]">{'// Recent'}</p>
        {total > RECENT_COUNT && (
          <Link
            href="/dashboard/jobs"
            className="text-xs text-[var(--ink-dim)] hover:text-[var(--ink)] transition-colors"
          >
            View more →
          </Link>
        )}
      </div>
      <JobsGrid
        jobs={jobs.map((job) => ({
          id: job._id.toString(),
          originalFilename: job.originalFilename,
          status: job.status,
          createdAt: job.createdAt,
        }))}
      />
    </section>
  )
}

function RecentJobsSkeleton() {
  return (
    <div className="mt-10 space-y-3">
      <div className="flex justify-between items-center mb-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-20" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: RECENT_COUNT }).map((_, i) => (
          <Skeleton key={i} className="aspect-[4/3] rounded-xl" />
        ))}
      </div>
    </div>
  )
}

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const [user, rendersRemaining] = await Promise.all([
    findByClerkId(userId),
    getRendersRemaining(userId),
  ])
  const isPaid = user?.subscriptionStatus === 'active'

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-7 sm:py-10">
      <p className="text-[11px] tracking-[0.15em] uppercase text-[var(--mute)] mb-1.5">{'// New Upload'}</p>
      <h1 className="text-2xl font-bold tracking-tight text-[var(--ink)] font-[family-name:var(--font-display)]">New video</h1>
      <p className="text-[13px] text-[var(--ink-dim)] mt-1.5">
        Upload a clip, pick a caption style, export word-by-word animated captions.
      </p>

      <div className="mt-6">
        <UploadDropzone isPaid={isPaid} rendersRemaining={rendersRemaining} />
      </div>

      <Suspense fallback={<RecentJobsSkeleton />}>
        <RecentJobs userId={userId} />
      </Suspense>
    </div>
  )
}
