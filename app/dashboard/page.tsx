import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { connectDB } from '@/src/lib/mongo'
import { findJobsByUserId } from '@/src/repositories/job.repository'
import { findByClerkId } from '@/src/repositories/user.repository'
import { getRendersRemaining } from '@/src/services/billing.service'
import { UploadDropzone } from '@/components/upload-dropzone'
import { JobsGrid } from '@/components/jobs-table'
import Link from 'next/link'

const RECENT_COUNT = 4

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  await connectDB()
  const [{ jobs, total }, user, rendersRemaining] = await Promise.all([
    findJobsByUserId(userId, { page: 1, pageSize: RECENT_COUNT }),
    findByClerkId(userId),
    getRendersRemaining(userId),
  ])
  const isPaid = user?.subscriptionStatus === 'active'

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-7 sm:py-10">
      <p className="text-[11px] tracking-[0.15em] uppercase text-[#a39e96] mb-1.5">{'// New Upload'}</p>
      <h1 className="text-2xl font-bold tracking-wide uppercase text-[#1a1917]">New video</h1>
      <p className="text-[13px] text-[#6b6862] mt-1.5">
        Upload a clip, pick a caption style, export word-by-word animated captions.
      </p>

      <div className="mt-6">
        <UploadDropzone isPaid={isPaid} rendersRemaining={rendersRemaining} />
      </div>

      {/* Recent jobs — card view */}
      {jobs.length > 0 && (
        <section className="mt-10">
          <div className="flex items-baseline justify-between mb-3">
            <p className="text-[11px] tracking-[0.15em] uppercase text-[#a39e96]">{'// Recent'}</p>
            {total > RECENT_COUNT && (
              <Link
                href="/dashboard/jobs"
                className="text-xs text-[#6b6862] hover:text-[#1a1917] transition-colors"
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
      )}
    </div>
  )
}
