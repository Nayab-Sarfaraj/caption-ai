export interface RenderJobPayload {
  jobId: string
  userId: string
  videoKey: string
  transcriptKey?: string
  compositionId: 'WordByWord' | 'Karaoke' | 'Fade' | 'Spring' | 'Hype' | 'Hormozi' | 'Minimal' | 'BoxHighlight' | 'Comic' | 'Pill' | 'Script' | 'SingleWord' | 'Typewriter' | 'NeonGlow' | 'CaptionBar' | 'Gradient' | 'Highlighter' | 'Underline' | 'Glide' | 'Outline' | 'Meme'
  fps: number
  outputFormat: 'mp4'
  phase: 'transcribe' | 'render'
  activeColor?: string  // highlight color, default #FACC15
  textColor?: string    // base text color, default #FFFFFF
  accentColor?: string  // BoxHighlight in-box text color, default #A3E635
  fontFamily?: string   // CSS font-family stack, composition falls back to its own default
  fontSizeMultiplier?: number // caption scale, default 1 — must be threaded or preview≠render
  posX?: number         // caption horizontal position, 0–100 % of frame (default 50 = center)
  posY?: number         // caption vertical position, 0–100 % of frame (default 82 = lower third)
  watermark?: boolean   // free-tier render — drawn by CaptionRoot.tsx's overlay, see worker/render.ts
}

export interface JobProgressEvent {
  type: 'progress' | 'done' | 'failed'
  renderedFrames?: number
  totalFrames?: number
  outputKey?: string
  errorMessage?: string
}
