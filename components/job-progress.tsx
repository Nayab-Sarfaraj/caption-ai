'use client'

import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { JobProgressEvent } from '@/src/types/job.types'

interface JobProgressProps {
  jobId: string
  initialStatus: string
  onDone?: (outputKey: string) => void
  onFailed?: (errorMessage: string) => void
}

interface ProgressState {
  status: 'streaming' | 'done' | 'failed'
  percent: number
  errorMessage?: string
}

export function JobProgress({ jobId, initialStatus, onDone, onFailed }: JobProgressProps) {
  const queryClient = useQueryClient()
  const [state, setState] = useState<ProgressState>({
    status: 'streaming',
    percent: 0,
  })

  const isTerminal = initialStatus === 'done' || initialStatus === 'failed'

  useEffect(() => {
    if (isTerminal) return

    const sse = new EventSource(`/api/jobs/${jobId}/stream`)

    sse.onmessage = (e: MessageEvent) => {
      try {
        const event = JSON.parse(e.data as string) as JobProgressEvent
        if (event.type === 'progress') {
          const percent =
            event.totalFrames && event.totalFrames > 0
              ? Math.round(((event.renderedFrames ?? 0) / event.totalFrames) * 100)
              : 0
          setState({ status: 'streaming', percent })
        } else if (event.type === 'done') {
          setState({ status: 'done', percent: 100 })
          queryClient.invalidateQueries({ queryKey: ['job', jobId] })
          sse.close()
          if (event.outputKey) onDone?.(event.outputKey)
        } else if (event.type === 'failed') {
          setState({ status: 'failed', percent: 0, errorMessage: event.errorMessage })
          queryClient.invalidateQueries({ queryKey: ['job', jobId] })
          sse.close()
          if (event.errorMessage) onFailed?.(event.errorMessage)
        }
      } catch {
        // ignore parse errors
      }
    }

    sse.onerror = () => {
      setState((s) => ({ ...s, status: 'failed', errorMessage: 'Connection lost' }))
      sse.close()
    }

    return () => sse.close()
  }, [jobId, isTerminal, queryClient, onDone, onFailed])

  if (isTerminal) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {state.status === 'done'
            ? 'Render complete'
            : state.status === 'failed'
            ? 'Render failed'
            : `Rendering… ${state.percent}%`}
        </span>
        <span className="font-mono text-xs">{state.percent}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${state.percent}%` }}
        />
      </div>
      {state.status === 'failed' && state.errorMessage && (
        <p className="text-sm text-destructive">{state.errorMessage}</p>
      )}
    </div>
  )
}
