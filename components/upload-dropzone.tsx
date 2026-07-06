'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

type CompositionId = 'WordByWord' | 'Karaoke' | 'Fade' | 'Spring'
type UploadStep = 'idle' | 'getting-url' | 'uploading' | 'confirming' | 'done' | 'error'

const ACCEPTED_VIDEO = { 'video/mp4': ['.mp4'], 'video/quicktime': ['.mov'] }
const ACCEPTED_CAPTION = { 'text/plain': ['.srt', '.vtt'], 'text/vtt': ['.vtt'] }
const MAX_VIDEO_SIZE = 500 * 1024 * 1024

const STYLES: { id: CompositionId; label: string; preview: string; desc: string }[] = [
  { id: 'WordByWord', label: 'Word by Word', preview: 'the [WORD] pops',     desc: 'Active word scales up' },
  { id: 'Karaoke',   label: 'Karaoke',      preview: 'past · now · future', desc: 'Words shift color' },
  { id: 'Fade',      label: 'Fade',          preview: 'Line fades in...',    desc: 'Line fades per segment' },
  { id: 'Spring',    label: 'Spring',        preview: 'Words ↑ bounce ↑ up', desc: 'Words spring from below' },
]

export function UploadDropzone() {
  const router = useRouter()
  const [step, setStep]                   = useState<UploadStep>('idle')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError]                 = useState<string | null>(null)
  const [videoFile, setVideoFile]         = useState<File | null>(null)
  const [captionFile, setCaptionFile]     = useState<File | null>(null)
  const [style, setStyle]                 = useState<CompositionId>('WordByWord')
  const [showCaption, setShowCaption]     = useState(false)

  const onVideoDrop   = useCallback((f: File[]) => { if (f[0]) setVideoFile(f[0]) }, [])
  const onCaptionDrop = useCallback((f: File[]) => { if (f[0]) setCaptionFile(f[0]) }, [])

  const videoDropzone = useDropzone({
    onDrop: onVideoDrop,
    accept: ACCEPTED_VIDEO,
    maxSize: MAX_VIDEO_SIZE,
    multiple: false,
  })

  const captionDropzone = useDropzone({
    onDrop: onCaptionDrop,
    accept: ACCEPTED_CAPTION,
    multiple: false,
  })

  const isUploading = ['getting-url', 'uploading', 'confirming'].includes(step)

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!videoFile) throw new Error('No video selected')
      setError(null)

      setStep('getting-url')
      const presignRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: videoFile.name, contentType: videoFile.type, fileSize: videoFile.size }),
      })
      if (!presignRes.ok) {
        const err = await presignRes.json()
        throw new Error(err.error ?? 'Failed to get upload URL')
      }
      const { uploadUrl, jobId } = await presignRes.json()

      setStep('uploading')
      setUploadProgress(0)
      await uploadToR2(uploadUrl, videoFile, setUploadProgress)

      if (captionFile) {
        const text = await captionFile.text()
        const res = await fetch('/api/upload/captions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobId, content: text, filename: captionFile.name }),
        })
        if (!res.ok) throw new Error((await res.json()).error ?? 'Caption upload failed')
      }

      setStep('confirming')
      const confirmRes = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, compositionId: style }),
      })
      if (!confirmRes.ok) throw new Error('Failed to confirm upload')

      setStep('done')
      return jobId as string
    },
    onSuccess: (jobId) => router.push(`/dashboard/jobs/${jobId}`),
    onError: (err: Error) => { setError(err.message); setStep('error') },
  })

  const stepLabel = {
    idle: '', 'getting-url': 'Preparing…', uploading: `Uploading ${uploadProgress}%`,
    confirming: 'Finalizing…', done: 'Done!', error: 'Upload failed',
  }

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        {...videoDropzone.getRootProps()}
        className={[
          'rounded-xl border-2 border-dashed p-10 text-center cursor-pointer transition-all',
          videoDropzone.isDragActive
            ? 'border-white/30 bg-white/5'
            : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]',
          isUploading ? 'pointer-events-none opacity-50' : '',
        ].join(' ')}
      >
        <input {...videoDropzone.getInputProps()} />
        {videoFile ? (
          <div className="space-y-1">
            <p className="text-sm font-medium text-white">{videoFile.name}</p>
            <p className="text-xs text-zinc-500">
              {(videoFile.size / 1024 / 1024).toFixed(1)} MB · {videoFile.type === 'video/mp4' ? 'MP4' : 'MOV'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="mx-auto w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
              <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-white">Drop your video here</p>
              <p className="text-xs text-zinc-500 mt-0.5">MP4 or MOV · max 500 MB · max 10 min</p>
            </div>
          </div>
        )}
      </div>

      {/* Style picker */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {STYLES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setStyle(s.id)}
            disabled={isUploading}
            className={[
              'rounded-lg border p-3 text-left transition-all space-y-1.5 disabled:opacity-40',
              style === s.id
                ? 'border-white bg-white/5'
                : 'border-white/10 hover:border-white/20',
            ].join(' ')}
          >
            <p className="text-[11px] font-mono text-zinc-400 truncate leading-relaxed">{s.preview}</p>
            <p className="text-xs font-medium text-white">{s.label}</p>
            <p className="text-[11px] text-zinc-500 leading-tight">{s.desc}</p>
          </button>
        ))}
      </div>

      {/* Optional SRT/VTT */}
      <div>
        <button
          type="button"
          onClick={() => setShowCaption(!showCaption)}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          {showCaption ? '− Hide' : '+ Have an .srt or .vtt? Skip AI transcription'}
        </button>
        {showCaption && (
          <div
            {...captionDropzone.getRootProps()}
            className={[
              'mt-2 rounded-lg border border-dashed p-4 text-center cursor-pointer transition-all',
              captionDropzone.isDragActive ? 'border-white/30 bg-white/5' : 'border-white/10 hover:border-white/20',
              isUploading ? 'pointer-events-none opacity-50' : '',
            ].join(' ')}
          >
            <input {...captionDropzone.getInputProps()} />
            {captionFile
              ? <span className="text-sm text-white">{captionFile.name}</span>
              : <span className="text-sm text-zinc-500">Drop .srt or .vtt</span>}
          </div>
        )}
      </div>

      {/* Progress bar */}
      {isUploading && (
        <div className="space-y-1.5">
          <div className="h-0.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-300"
              style={{ width: `${step === 'uploading' ? uploadProgress : 100}%` }}
            />
          </div>
          <p className="text-xs text-zinc-500 text-center">{stepLabel[step]}</p>
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      {/* CTA */}
      <button
        type="button"
        disabled={!videoFile || isUploading}
        onClick={() => uploadMutation.mutate()}
        className="w-full rounded-lg bg-white text-black text-sm font-medium py-2.5 hover:bg-zinc-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        {isUploading ? stepLabel[step] : 'Generate Captions'}
      </button>
    </div>
  )
}

async function uploadToR2(url: string, file: File, onProgress: (n: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
    })
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve()
      else reject(new Error(`R2 upload failed: ${xhr.status}`))
    })
    xhr.addEventListener('error', () => reject(new Error('Network error during upload')))
    xhr.open('PUT', url)
    xhr.setRequestHeader('Content-Type', file.type)
    xhr.send(file)
  })
}
