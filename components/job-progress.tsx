'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import type { JobProgressEvent } from '@/src/types/job.types'

interface JobProgressProps {
  jobId: string
  initialStatus: string
  onDone?: (outputKey: string) => void
  onFailed?: (errorMessage: string) => void
}

export function JobProgress({ jobId, initialStatus, onDone, onFailed }: JobProgressProps) {
  const queryClient = useQueryClient()
  const router = useRouter()
  const [percent, setPercent] = useState(0)
  const [statusLabel, setStatusLabel] = useState(formatStatus(initialStatus))

  const isTerminal = initialStatus === 'done' || initialStatus === 'failed' || initialStatus === 'transcript_ready'

  useEffect(() => {
    if (isTerminal) return

    let sse: EventSource | null = null
    let pollInterval: NodeJS.Timeout | null = null

    const startPolling = () => {
      if (pollInterval) return
      pollInterval = setInterval(async () => {
        try {
          const res = await fetch(`/api/jobs/${jobId}`)
          if (!res.ok) return
          const job = await res.json()
          if (job.status === 'done') {
            if (pollInterval) clearInterval(pollInterval)
            queryClient.invalidateQueries({ queryKey: ['job', jobId] })
            if (job.downloadUrl) onDone?.(job.downloadUrl)
            router.refresh()
          } else if (job.status === 'failed') {
            if (pollInterval) clearInterval(pollInterval)
            queryClient.invalidateQueries({ queryKey: ['job', jobId] })
            if (job.errorMessage) onFailed?.(job.errorMessage)
            router.refresh()
          } else if (job.status === 'transcript_ready') {
            if (pollInterval) clearInterval(pollInterval)
            queryClient.invalidateQueries({ queryKey: ['job', jobId] })
            router.refresh()
          }
        } catch {
          // ignore transient poll errors
        }
      }, 1500)
    }

    try {
      sse = new EventSource(`/api/jobs/${jobId}/stream`)

      sse.onmessage = (e: MessageEvent) => {
        try {
          const event = JSON.parse(e.data as string) as JobProgressEvent
          if (event.type === 'progress') {
            const pct =
              event.totalFrames && event.totalFrames > 0
                ? Math.round(((event.renderedFrames ?? 0) / event.totalFrames) * 100)
                : 0
            setPercent(pct)
            setStatusLabel(`Rendering ${pct}%`)
          } else if (event.type === 'done') {
            queryClient.invalidateQueries({ queryKey: ['job', jobId] })
            sse?.close()
            if (event.outputKey) onDone?.(event.outputKey)
            router.refresh()
          } else if (event.type === 'failed') {
            queryClient.invalidateQueries({ queryKey: ['job', jobId] })
            sse?.close()
            if (event.errorMessage) onFailed?.(event.errorMessage)
            router.refresh()
          }
        } catch {
          // ignore parse errors
        }
      }

      sse.onerror = () => {
        sse?.close()
        startPolling()
      }
    } catch {
      startPolling()
    }

    return () => {
      sse?.close()
      if (pollInterval) clearInterval(pollInterval)
    }
  }, [jobId, isTerminal, queryClient, router, onDone, onFailed])

  if (isTerminal) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-[var(--ink-dim)]">
        <span>{statusLabel}</span>
        <span className="tabular-nums">{percent}%</span>
      </div>
      <div className="h-[3px] w-full bg-[var(--hair)] overflow-hidden rounded-full">
        <div
          className="h-full bg-[var(--brand)] rounded-full transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

function formatStatus(s: string): string {
  const map: Record<string, string> = {
    pending: 'Waiting in queue…',
    processing: 'Processing…',
    transcribing: 'Transcribing audio…',
    transcript_ready: 'Transcript ready',
    rendering: 'Rendering…',
  }
  return map[s] ?? s
}
