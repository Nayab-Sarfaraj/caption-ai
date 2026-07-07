export interface RenderJobPayload {
  jobId: string
  userId: string
  videoKey: string
  transcriptKey?: string
  compositionId: 'WordByWord' | 'Karaoke' | 'Fade' | 'Spring' | 'Hype' | 'Hormozi' | 'Minimal' | 'BoxHighlight' | 'Comic' | 'Pill' | 'Script'
  fps: number
  outputFormat: 'mp4'
  phase: 'transcribe' | 'render'
  activeColor?: string  // highlight color, default #FACC15
  textColor?: string    // base text color, default #FFFFFF
  accentColor?: string  // BoxHighlight in-box text color, default #A3E635
}

export interface JobProgressEvent {
  type: 'progress' | 'done' | 'failed'
  renderedFrames?: number
  totalFrames?: number
  outputKey?: string
  errorMessage?: string
}
