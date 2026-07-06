export interface RenderJobPayload {
  jobId: string
  userId: string
  videoKey: string
  transcriptKey?: string
  compositionId: 'WordByWord' | 'Karaoke' | 'Fade' | 'Spring'
  fps: number
  outputFormat: 'mp4'
}

export interface JobProgressEvent {
  type: 'progress' | 'done' | 'failed'
  renderedFrames?: number
  totalFrames?: number
  outputKey?: string
  errorMessage?: string
}
