import { z } from 'zod'

const envSchema = z.object({
  // Clerk
  CLERK_SECRET_KEY: z.string().min(1),
  CLERK_WEBHOOK_SECRET: z.string().min(1),

  // MongoDB
  MONGO_URI: z.string().min(1),

  // Redis
  UPSTASH_REDIS_URL: z.string().min(1),

  // Cloudflare R2
  CLOUDFLARE_ACCOUNT_ID: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_BUCKET_NAME: z.string().min(1),

  // Deepgram
  DEEPGRAM_API_KEY: z.string().min(1),
  TRANSCRIPTION_PROVIDER: z.enum(['deepgram', 'whisper']).default('deepgram'),

  // Razorpay
  RAZORPAY_KEY_ID: z.string().min(1),
  RAZORPAY_KEY_SECRET: z.string().min(1),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1),
  RAZORPAY_PLAN_ID: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
})

// Validate at import time — fail loudly on startup, not silently at runtime
export const env = envSchema.parse(process.env)
