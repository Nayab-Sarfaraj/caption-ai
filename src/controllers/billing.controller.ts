import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/src/lib/razorpay'
import { createSubscription, cancelSubscription, handleWebhookEvent } from '@/src/services/billing.service'

export async function handleCreateSubscription(): Promise<NextResponse> {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { shortUrl } = await createSubscription(userId)
    return NextResponse.json({ shortUrl })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Subscription creation failed'
    console.error('Razorpay subscription create error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function handleCancelSubscription(): Promise<NextResponse> {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await cancelSubscription(userId)
    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Cancel failed'
    console.error('Razorpay subscription cancel error:', message)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function handleRazorpayWebhook(req: NextRequest): Promise<NextResponse> {
  const body = await req.text()
  const signature = req.headers.get('x-razorpay-signature')
  if (!signature) return NextResponse.json({ error: 'Missing signature' }, { status: 400 })

  if (!verifyWebhookSignature(body, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const event = JSON.parse(body)
  await handleWebhookEvent(event)

  return NextResponse.json({ ok: true })
}
