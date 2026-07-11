import { JobCard, type JobListItem } from '@/components/jobs-table'

export function BatchProgress({ batchId, jobs }: { batchId: string; jobs: JobListItem[] }) {
  const total = jobs.length
  const done = jobs.filter((j) => j.status === 'done').length
  const failed = jobs.filter((j) => j.status === 'failed').length

  return (
    <div className="col-span-full border border-[#14120f1f] bg-white rounded-xl p-3.5 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-[#1a1917]">Batch upload · {total} videos</p>
        <span className="text-xs text-[#6b6862] tabular-nums">
          {done}/{total} done{failed > 0 ? ` · ${failed} failed` : ''}
        </span>
      </div>
      <div className="h-1.5 w-full bg-[#14120f1f] overflow-hidden rounded-full">
        <div
          className="h-full bg-[#c1361f] transition-all duration-300"
          style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }}
        />
      </div>
      {/* Single worker renders one at a time — batch progress is sequential, not parallel */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3" data-batch-id={batchId}>
        {jobs.map((job) => <JobCard key={job.id} job={job} />)}
      </div>
    </div>
  )
}
