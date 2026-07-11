'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { CaptionStylePreview } from '@/components/caption-style-preview'

type CompositionId = 'WordByWord' | 'Karaoke' | 'Fade' | 'Spring' | 'Hype' | 'Hormozi' | 'Minimal' | 'BoxHighlight' | 'Comic' | 'Pill' | 'Script'
type UploadStep = 'idle' | 'getting-url' | 'uploading' | 'confirming' | 'done' | 'error'

const ACCEPTED_VIDEO = { 'video/mp4': ['.mp4'], 'video/quicktime': ['.mov'] }
const ACCEPTED_CAPTION = { 'text/plain': ['.srt', '.vtt'], 'text/vtt': ['.vtt'] }
const MAX_VIDEO_SIZE = 500 * 1024 * 1024
const MAX_BATCH_FILES = 10 // matches batchUploadRequestSchema server-side cap

const STYLES: { id: CompositionId; label: string; desc: string }[] = [
  { id: 'WordByWord', label: 'Word by Word', desc: 'Active word scales up' },
  { id: 'Karaoke',   label: 'Karaoke',      desc: 'Words shift color' },
  { id: 'Fade',      label: 'Fade',          desc: 'Line fades per segment' },
  { id: 'Spring',    label: 'Spring',        desc: 'Words spring from below' },
  { id: 'Hype',      label: 'Hype',          desc: 'MrBeast-style bounce + glow' },
  { id: 'Hormozi',   label: 'Hormozi',       desc: 'Yellow-stroke pop-in, Anton font' },
  { id: 'Minimal',   label: 'Minimal',       desc: 'Restrained, single-color, no hype' },
  { id: 'BoxHighlight', label: 'Box Highlight', desc: 'Captions.ai-style keyword box pop' },
  { id: 'Comic',     label: 'Comic',         desc: 'Cartoon font, keyword color swap' },
  { id: 'Pill',      label: 'Pill',          desc: 'Clean dark pill badge, no hype' },
  { id: 'Script',    label: 'Script',        desc: 'Gold italic script accent word' },
]

export function UploadDropzone() {
  const router = useRouter()
  const [step, setStep]                   = useState<UploadStep>('idle')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError]                 = useState<string | null>(null)
  const [batchMode, setBatchMode]         = useState(false)
  const [videoFile, setVideoFile]         = useState<File | null>(null)
  const [videoFiles, setVideoFiles]       = useState<File[]>([])
  const [captionFile, setCaptionFile]     = useState<File | null>(null)
  const [style, setStyle]                 = useState<CompositionId>('WordByWord')
  const [showCaption, setShowCaption]     = useState(false)

  const onVideoDrop = useCallback(
    (f: File[]) => {
      if (batchMode) setVideoFiles(f.slice(0, MAX_BATCH_FILES))
      else if (f[0]) setVideoFile(f[0])
    },
    [batchMode]
  )
  const onCaptionDrop = useCallback((f: File[]) => { if (f[0]) setCaptionFile(f[0]) }, [])

  const videoDropzone = useDropzone({
    onDrop: onVideoDrop,
    accept: ACCEPTED_VIDEO,
    maxSize: MAX_VIDEO_SIZE,
    multiple: batchMode,
  })

  const captionDropzone = useDropzone({
    onDrop: onCaptionDrop,
    accept: ACCEPTED_CAPTION,
    multiple: false,
  })

  const isUploading = ['getting-url', 'uploading', 'confirming'].includes(step)
  const hasFiles = batchMode ? videoFiles.length > 0 : !!videoFile

  const toggleBatchMode = useCallback(() => {
    setBatchMode((m) => !m)
    setVideoFile(null)
    setVideoFiles([])
    setCaptionFile(null)
    setShowCaption(false)
    setError(null)
  }, [])

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
      const dims = await getVideoDimensions(videoFile).catch(() => ({ width: 1920, height: 1080 }))
      const confirmRes = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, compositionId: style, ...dims }),
      })
      if (!confirmRes.ok) throw new Error('Failed to confirm upload')

      setStep('done')
      return { jobId: jobId as string, isBatch: false as const }
    },
    onSuccess: (result) => router.push(result.isBatch ? '/dashboard/jobs' : `/dashboard/jobs/${result.jobId}`),
    onError: (err: Error) => { setError(err.message); setStep('error') },
  })

  const batchUploadMutation = useMutation({
    mutationFn: async () => {
      if (videoFiles.length === 0) throw new Error('No videos selected')
      setError(null)

      setStep('getting-url')
      const presignRes = await fetch('/api/upload/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: videoFiles.map((f) => ({ filename: f.name, contentType: f.type, fileSize: f.size })),
        }),
      })
      if (!presignRes.ok) {
        const err = await presignRes.json()
        throw new Error(err.error ?? 'Failed to get upload URLs')
      }
      const { uploads } = await presignRes.json() as { uploads: { jobId: string; uploadUrl: string; key: string }[] }

      setStep('uploading')
      const perFileProgress = new Array(videoFiles.length).fill(0)
      const updateAggregate = () => {
        const avg = perFileProgress.reduce((a, b) => a + b, 0) / perFileProgress.length
        setUploadProgress(Math.round(avg))
      }

      // Bytes go direct to R2 in parallel — same single-upload logic per file,
      // just fanned out. Single worker still renders one job at a time
      // (Phase 1 concurrency:1) — parallel upload, sequential render.
      await Promise.all(
        uploads.map((u, i) =>
          uploadToR2(u.uploadUrl, videoFiles[i], (pct) => {
            perFileProgress[i] = pct
            updateAggregate()
          })
        )
      )

      setStep('confirming')
      await Promise.all(
        uploads.map(async (u, i) => {
          const dims = await getVideoDimensions(videoFiles[i]).catch(() => ({ width: 1920, height: 1080 }))
          const res = await fetch('/api/jobs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jobId: u.jobId, compositionId: style, ...dims }),
          })
          if (!res.ok) throw new Error(`Failed to confirm ${videoFiles[i].name}`)
        })
      )

      setStep('done')
    },
    onSuccess: () => router.push('/dashboard/jobs'),
    onError: (err: Error) => { setError(err.message); setStep('error') },
  })

  const stepLabel = {
    idle: '', 'getting-url': 'Preparing…', uploading: `Uploading ${uploadProgress}%`,
    confirming: 'Finalizing…', done: 'Done!', error: 'Upload failed',
  }

  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] tracking-[0.15em] uppercase text-[#a39e96]">{'// Upload'}</p>
        <button
          type="button"
          onClick={toggleBatchMode}
          disabled={isUploading}
          className="text-xs text-[#a39e96] hover:text-[#6b6862] transition-colors disabled:opacity-40"
        >
          {batchMode ? '← Single video upload' : `Upload multiple videos (up to ${MAX_BATCH_FILES})`}
        </button>
      </div>

      {/* Drop zone */}
      <div
        {...videoDropzone.getRootProps()}
        className={[
          'border min-h-[200px] flex items-center justify-center text-center cursor-pointer transition-colors duration-150 bg-white',
          videoDropzone.isDragActive ? 'border-[#c1361f] bg-[#c1361f08]' : 'border-[#14120f1f] hover:border-[#14120f3d]',
          isUploading ? 'pointer-events-none opacity-50' : '',
        ].join(' ')}
      >
        <input {...videoDropzone.getInputProps()} />
        {batchMode ? (
          videoFiles.length > 0 ? (
            <div className="w-full py-6 px-4 space-y-1.5 max-h-[200px] overflow-y-auto text-left">
              {videoFiles.map((f, i) => (
                <div key={`${f.name}-${i}`} className="flex items-center justify-between text-sm">
                  <span className="text-[#1a1917] truncate">{f.name}</span>
                  <span className="text-xs text-[#6b6862] shrink-0 ml-2">{(f.size / 1024 / 1024).toFixed(1)} MB</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8">
              <div className="w-9 h-9 mx-auto mb-3.5 border border-[#14120f1f] flex items-center justify-center text-[#6b6862]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <p className="text-sm text-[#1a1917]">Drop up to {MAX_BATCH_FILES} videos</p>
              <p className="text-xs text-[#a39e96] mt-1.5">MP4 or MOV · 500MB max each</p>
            </div>
          )
        ) : videoFile ? (
          <div className="space-y-1.5 py-8">
            <p className="text-sm text-[#1a1917]">{videoFile.name}</p>
            <p className="text-xs text-[#6b6862]">
              {(videoFile.size / 1024 / 1024).toFixed(1)} MB · {videoFile.type === 'video/mp4' ? 'MP4' : 'MOV'}
            </p>
          </div>
        ) : (
          <div className="py-8">
            <div className="w-9 h-9 mx-auto mb-3.5 border border-[#14120f1f] flex items-center justify-center text-[#6b6862]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <p className="text-sm text-[#1a1917]">Import or drag your video</p>
            <p className="text-xs text-[#a39e96] mt-1.5">MP4 or MOV · 500MB max · 10:00 max</p>
          </div>
        )}
      </div>

      {/* Style picker — CC channel tiles */}
      <div className="space-y-2.5">
        <div className="flex items-baseline justify-between">
          <p className="text-[11px] tracking-[0.15em] uppercase text-[#a39e96]">
            Caption Style{batchMode && ' (applies to all videos)'}
          </p>
          <span className="text-[11px] text-[#a39e96]">{STYLES.length} styles</span>
        </div>
        <div className="relative">
          <div className="flex gap-3 overflow-x-auto pb-1 -mx-0.5 px-0.5 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {STYLES.map((s) => {
              const active = style === s.id
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStyle(s.id)}
                  disabled={isUploading}
                  className={[
                    'shrink-0 w-[148px] snap-start text-left transition-all disabled:opacity-40 overflow-hidden rounded-xl',
                    active ? 'ring-2 ring-inset ring-[#c1361f]' : 'ring-1 ring-inset ring-[#14120f1f] hover:ring-[#14120f3d]',
                  ].join(' ')}
                >
                  <div className="relative">
                    <CaptionStylePreview id={s.id} />
                    {active && (
                      <span className="absolute top-1.5 left-1.5 w-4 h-4 rounded-full bg-[#c1361f] flex items-center justify-center">
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </span>
                    )}
                  </div>
                  <div className="px-3 py-2.5 bg-white">
                    <p className="text-xs text-[#1a1917] font-medium">{s.label}</p>
                    <p className="text-[11px] text-[#a39e96] leading-tight mt-1 line-clamp-1">{s.desc}</p>
                  </div>
                </button>
              )
            })}
            {/* trailing spacer so the last card can scroll fully clear of the fade */}
            <div className="shrink-0 w-2" aria-hidden="true" />
          </div>
          {/* right-edge fade signals there's more to scroll, instead of a hard clip */}
          <div className="absolute inset-y-0 right-0 w-14 pointer-events-none bg-gradient-to-r from-transparent to-[#faf9f6]" />
        </div>
      </div>

      {/* Optional SRT/VTT — single-upload only, batches always use AI transcription */}
      {!batchMode && (
        <div>
          <button
            type="button"
            onClick={() => setShowCaption(!showCaption)}
            className="text-xs text-[#a39e96] hover:text-[#6b6862] transition-colors"
          >
            {showCaption ? '− Hide' : '+ Have an .srt or .vtt? Skip AI transcription'}
          </button>
          {showCaption && (
            <div
              {...captionDropzone.getRootProps()}
              className={[
                'mt-2 border border-dashed p-4 text-center cursor-pointer transition-all bg-white',
                captionDropzone.isDragActive ? 'border-[#c1361f] bg-[#c1361f08]' : 'border-[#14120f1f] hover:border-[#14120f3d]',
                isUploading ? 'pointer-events-none opacity-50' : '',
              ].join(' ')}
            >
              <input {...captionDropzone.getInputProps()} />
              {captionFile
                ? <span className="text-sm text-[#1a1917]">{captionFile.name}</span>
                : <span className="text-sm text-[#a39e96]">Drop .srt or .vtt</span>}
            </div>
          )}
        </div>
      )}

      {/* Progress bar */}
      {isUploading && (
        <div className="space-y-1.5">
          <div className="h-[3px] w-full bg-[#14120f1f] overflow-hidden">
            <div
              className="h-full bg-[#c1361f] transition-all duration-300"
              style={{ width: `${step === 'uploading' ? uploadProgress : 100}%` }}
            />
          </div>
          <p className="text-xs text-[#a39e96] text-center">{stepLabel[step]}</p>
        </div>
      )}

      {error && <p className="text-sm text-[#c1361f]">{error}</p>}

      {/* CTA */}
      <button
        type="button"
        disabled={!hasFiles || isUploading}
        onClick={() => (batchMode ? batchUploadMutation.mutate() : uploadMutation.mutate())}
        className="w-full bg-[#c1361f] text-white text-sm font-bold py-3 hover:brightness-[1.08] transition-all disabled:opacity-35 disabled:cursor-not-allowed"
      >
        {isUploading
          ? stepLabel[step]
          : batchMode
            ? `Generate Captions${videoFiles.length ? ` · ${videoFiles.length} videos` : ''}`
            : 'Generate Captions'}
      </button>
    </div>
  )
}

function getVideoDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const url = URL.createObjectURL(file)
    video.onloadedmetadata = () => { URL.revokeObjectURL(url); resolve({ width: video.videoWidth, height: video.videoHeight }) }
    video.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Cannot read dimensions')) }
    video.src = url
  })
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
