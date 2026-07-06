'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

type UploadStep = 'idle' | 'getting-url' | 'uploading' | 'confirming' | 'done' | 'error'

const ACCEPTED_VIDEO = { 'video/mp4': ['.mp4'], 'video/quicktime': ['.mov'] }
const ACCEPTED_CAPTION = { 'text/plain': ['.srt', '.vtt'], 'text/vtt': ['.vtt'] }
const MAX_VIDEO_SIZE = 500 * 1024 * 1024

export function UploadDropzone() {
  const router = useRouter()
  const [step, setStep] = useState<UploadStep>('idle')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [captionFile, setCaptionFile] = useState<File | null>(null)

  const onVideoDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) setVideoFile(accepted[0])
  }, [])

  const onCaptionDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) setCaptionFile(accepted[0])
  }, [])

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

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!videoFile) throw new Error('No video selected')
      setError(null)

      // Step 1: Get presigned PUT URL + create Job
      setStep('getting-url')
      const presignRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: videoFile.name,
          contentType: videoFile.type,
          fileSize: videoFile.size,
        }),
      })
      if (!presignRes.ok) {
        const err = await presignRes.json()
        throw new Error(err.error ?? 'Failed to get upload URL')
      }
      const { uploadUrl, jobId } = await presignRes.json()

      // Step 2: Upload directly to R2
      setStep('uploading')
      setUploadProgress(0)
      await uploadToR2(uploadUrl, videoFile, setUploadProgress)

      // Step 3: Upload optional caption file
      if (captionFile) {
        const text = await captionFile.text()
        const captionRes = await fetch('/api/upload/captions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobId, content: text, filename: captionFile.name }),
        })
        if (!captionRes.ok) {
          const err = await captionRes.json()
          throw new Error(err.error ?? 'Failed to upload caption file')
        }
      }

      // Step 4: Confirm upload complete
      setStep('confirming')
      const confirmRes = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      })
      if (!confirmRes.ok) throw new Error('Failed to confirm upload')

      setStep('done')
      return jobId
    },
    onSuccess: (jobId: string) => {
      router.push(`/dashboard/jobs/${jobId}`)
    },
    onError: (err: Error) => {
      setError(err.message)
      setStep('error')
    },
  })

  const stepLabel: Record<UploadStep, string> = {
    idle: '',
    'getting-url': 'Preparing upload...',
    uploading: `Uploading video... ${uploadProgress}%`,
    confirming: 'Finalizing...',
    done: 'Done!',
    error: 'Upload failed',
  }

  const isUploading = ['getting-url', 'uploading', 'confirming'].includes(step)

  return (
    <div className="space-y-4 w-full max-w-xl">
      {/* Video drop zone */}
      <div
        {...videoDropzone.getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
          ${videoDropzone.isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/30 hover:border-primary/60'}
          ${isUploading ? 'pointer-events-none opacity-60' : ''}`}
      >
        <input {...videoDropzone.getInputProps()} />
        {videoFile ? (
          <div className="space-y-1">
            <p className="font-medium">{videoFile.name}</p>
            <p className="text-sm text-muted-foreground">
              {(videoFile.size / 1024 / 1024).toFixed(1)} MB
            </p>
            <Badge variant="secondary">Video ready</Badge>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-lg font-medium">Drop your video here</p>
            <p className="text-sm text-muted-foreground">MP4 or MOV · max 500 MB</p>
          </div>
        )}
      </div>

      {/* Caption file (optional) */}
      <div
        {...captionDropzone.getRootProps()}
        className={`border border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
          ${captionDropzone.isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/20 hover:border-primary/40'}
          ${isUploading ? 'pointer-events-none opacity-60' : ''}`}
      >
        <input {...captionDropzone.getInputProps()} />
        {captionFile ? (
          <p className="text-sm">
            <span className="font-medium">{captionFile.name}</span>{' '}
            <Badge variant="outline" className="ml-2">SRT/VTT</Badge>
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Optional: drop an .srt or .vtt file to skip AI transcription
          </p>
        )}
      </div>

      {/* Progress */}
      {isUploading && (
        <div className="space-y-2">
          <Progress value={step === 'uploading' ? uploadProgress : 100} />
          <p className="text-sm text-center text-muted-foreground">{stepLabel[step]}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}

      {/* Submit */}
      <Button
        className="w-full"
        disabled={!videoFile || isUploading}
        onClick={() => uploadMutation.mutate()}
      >
        {isUploading ? stepLabel[step] : 'Generate Captions'}
      </Button>
    </div>
  )
}

async function uploadToR2(
  url: string,
  file: File,
  onProgress: (pct: number) => void
): Promise<void> {
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
