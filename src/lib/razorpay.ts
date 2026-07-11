import Razorpay from 'razorpay'
import { env } from '@/config/env'

declare global {
  var _razorpay: Razorpay | undefined
}

export function getRazorpay(): Razorpay {
  if (global._razorpay) return global._razorpay

  global._razorpay = new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET,
  })

  return global._razorpay
}

// HMAC-SHA256 over the raw body — caller must pass req.text(), never req.json()
// (re-serializing breaks the signature check silently).
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  return Razorpay.validateWebhookSignature(rawBody, signature, env.RAZORPAY_WEBHOOK_SECRET)
}
