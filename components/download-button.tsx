'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface DownloadButtonProps {
  jobId: string
  filename?: string
}

export function DownloadButton({ jobId, filename = 'captioned-video.mp4' }: DownloadButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDownload = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/jobs/${jobId}`)
      if (!res.ok) throw new Error('Failed to get download URL')
      const data = (await res.json()) as { downloadUrl?: string }
      if (!data.downloadUrl) throw new Error('No download URL in response')

      // Trigger browser download via temporary anchor
      const a = document.createElement('a')
      a.href = data.downloadUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button onClick={handleDownload} disabled={loading} className="w-full">
        {loading ? 'Getting download link…' : 'Download Captioned Video'}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
