import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { connectDB } from '@/src/lib/mongo'
import { findJobsByUserId } from '@/src/repositories/job.repository'
import { JobsTable } from '@/components/jobs-table'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

const PAGE_SIZE = 20

export default async function AllJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)

  await connectDB()
  const { jobs, total } = await findJobsByUserId(userId, { page, pageSize: PAGE_SIZE })

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const startIndex = (page - 1) * PAGE_SIZE

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-7 sm:py-10 font-[family-name:var(--font-cc)]">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-[#6b6862] hover:text-[#1a1917] transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back
      </Link>

      <div className="flex items-baseline justify-between mt-5 mb-3">
        <div>
          <p className="text-[11px] tracking-[0.15em] uppercase text-[#a39e96] mb-1.5">{'// All Videos'}</p>
          <h1 className="text-2xl font-bold tracking-wide uppercase text-[#1a1917]">Videos</h1>
        </div>
        <span className="text-xs text-[#a39e96] tabular-nums">{total} total</span>
      </div>

      {jobs.length === 0 ? (
        <p className="text-sm text-[#a39e96] mt-6">No videos yet.</p>
      ) : (
        <>
          <JobsTable
            jobs={jobs.map((job) => ({
              id: job._id.toString(),
              originalFilename: job.originalFilename,
              status: job.status,
              createdAt: job.createdAt,
            }))}
            startIndex={startIndex}
          />

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <Link
                href={`/dashboard/jobs?page=${page - 1}`}
                aria-disabled={page <= 1}
                className={[
                  'text-xs px-3 py-1.5 border border-[#14120f1f]',
                  page <= 1 ? 'pointer-events-none opacity-30' : 'text-[#1a1917] hover:border-[#14120f3d]',
                ].join(' ')}
              >
                ← Prev
              </Link>
              <span className="text-xs text-[#a39e96] tabular-nums">
                {String(page).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}
              </span>
              <Link
                href={`/dashboard/jobs?page=${page + 1}`}
                aria-disabled={page >= totalPages}
                className={[
                  'text-xs px-3 py-1.5 border border-[#14120f1f]',
                  page >= totalPages ? 'pointer-events-none opacity-30' : 'text-[#1a1917] hover:border-[#14120f3d]',
                ].join(' ')}
              >
                Next →
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  )
}
