import Link from 'next/link'

export const JOB_STATUS: Record<string, { color: string; label: string }> = {
  done:             { color: 'var(--ok)', label: 'DONE' },
  rendering:        { color: 'var(--warn)', label: 'RENDERING' },
  transcribing:     { color: 'var(--warn)', label: 'TRANSCRIBING' },
  transcript_ready: { color: 'var(--pop-cyan)', label: 'READY' },
  processing:       { color: 'var(--warn)', label: 'PROCESSING' },
  pending:          { color: 'var(--mute)', label: 'PENDING' },
  failed:           { color: 'var(--brand)', label: 'FAILED' },
}

export function jobTimecode(date: Date): string {
  const s = Math.floor((Date.now() - date.getTime()) / 1000)
  if (s < 60) return `-00:00:${String(s).padStart(2, '0')}`
  const m = Math.floor(s / 60)
  if (m < 60) return `-00:${String(m).padStart(2, '0')}:00`
  const h = Math.floor(m / 60)
  if (h < 24) return `-${String(h).padStart(2, '0')}:00:00`
  return `-${String(Math.floor(h / 24)).padStart(2, '0')}d`
}

export interface JobListItem {
  id: string
  originalFilename: string
  status: string
  createdAt?: Date | string | null
  batchId?: string | null
}

export function JobsTable({ jobs, startIndex = 0 }: { jobs: JobListItem[]; startIndex?: number }) {
  return (
    <div className="border border-[var(--hair)] divide-y divide-[var(--hair)] bg-[var(--panel)] rounded-2xl">
      {jobs.map((job, i) => {
        const s = JOB_STATUS[job.status] ?? JOB_STATUS.pending
        return (
          <Link
            key={job.id}
            href={`/dashboard/jobs/${job.id}`}
            className="grid grid-cols-[2.5rem_1fr_auto] sm:grid-cols-[2.5rem_7rem_1fr_auto] items-center gap-3 px-3.5 py-3 hover:bg-[var(--brand-soft)] transition-colors"
          >
            <span className="text-xs text-[var(--faint)]">{String(startIndex + i + 1).padStart(2, '0')}</span>
            <span className="hidden sm:inline text-xs text-[var(--mute)]">
              {job.createdAt ? jobTimecode(new Date(job.createdAt)) : '--:--:--'}
            </span>
            <span className="text-sm text-[var(--ink)] truncate">{job.originalFilename}</span>
            <span className="inline-flex items-center gap-2 text-xs justify-self-end" style={{ color: s.color }}>
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
              {s.label}
            </span>
          </Link>
        )
      })}
    </div>
  )
}

export function JobCard({ job }: { job: JobListItem }) {
  const s = JOB_STATUS[job.status] ?? JOB_STATUS.pending
  return (
    <Link
      href={`/dashboard/jobs/${job.id}`}
      className="group overflow-hidden rounded-xl ring-1 ring-inset ring-[var(--hair)] hover:ring-[var(--faint)] transition-colors bg-[var(--panel)]"
    >
      <div
        className="relative aspect-video flex items-center justify-center"
        style={{ background: 'radial-gradient(130% 100% at 25% 10%, #302f2c 0%, #1a1917 55%, #0a0a09 100%)' }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white/25 group-hover:text-white/40 transition-colors">
          <path d="M8 5.5v13l11-6.5-11-6.5z" fill="currentColor" />
        </svg>
        <span
          className="absolute top-2 right-2 inline-flex items-center gap-1.5 text-[10px] px-1.5 py-1 rounded-[3px] bg-black/45"
          style={{ color: s.color }}
        >
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
          {s.label}
        </span>
      </div>
      <div className="px-3 py-2.5">
        <p className="text-xs font-medium text-[var(--ink)] truncate">{job.originalFilename}</p>
        <p className="text-[11px] text-[var(--mute)] mt-0.5">
          {job.createdAt ? jobTimecode(new Date(job.createdAt)) : '--:--:--'}
        </p>
      </div>
    </Link>
  )
}

export function JobsGrid({ jobs }: { jobs: JobListItem[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {jobs.map((job) => <JobCard key={job.id} job={job} />)}
    </div>
  )
}
