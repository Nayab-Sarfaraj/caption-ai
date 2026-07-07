'use client'

import { useState } from 'react'

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
      if (!data.downloadUrl) throw new Error('No download URL')

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
    <div className="space-y-2 font-[family-name:var(--font-cc)]">
      <button
        onClick={handleDownload}
        disabled={loading}
        className="w-full bg-[#c1361f] text-white text-sm font-bold py-2.5 hover:brightness-[1.08] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Getting link…' : 'Download Captioned Video'}
      </button>
      {error && <p className="text-xs text-[#c1361f]">{error}</p>}
    </div>
  )
}
