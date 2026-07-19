import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { validateEvent, WebhookVerificationError } from '@polar-sh/sdk/webhooks'
import { env } from '@/config/env'
import { createCheckout, cancelSubscription, handleWebhookEvent, createCustomerPortalUrl } from '@/src/services/billing.service'
import { createCheckoutSchema } from '@/src/helpers/validators'
import { getPostHog } from '@/src/lib/posthog'
import { notifyDiscord, DISCORD_COLOR } from '@/src/lib/discord'

export async function handleCreateCheckout(req: NextRequest): Promise<NextResponse> {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = createCheckoutSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid or missing tier' }, { status: 400 })

  try {
    const { url } = await createCheckout(userId, parsed.data.tier)
    getPostHog()?.capture({ distinctId: userId, event: 'checkout_started', properties: { tier: parsed.data.tier } })
    return NextResponse.json({ url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Checkout creation failed'
    console.error('Polar checkout create error:', message)
    notifyDiscord({
      title: '🔴 Checkout creation failed',
      color: DISCORD_COLOR.error,
      fields: [
        { name: 'User', value: userId, inline: true },
        { name: 'Error', value: message },
      ],
    })
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
    console.error('Polar subscription cancel error:', message)
    notifyDiscord({
      title: '🔴 Subscription cancel failed',
      color: DISCORD_COLOR.error,
      fields: [
        { name: 'User', value: userId, inline: true },
        { name: 'Error', value: message },
      ],
    })
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function handleCreatePortalSession(): Promise<NextResponse> {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const url = await createCustomerPortalUrl(userId)
    return NextResponse.json({ url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Portal session creation failed'
    console.error('Polar portal session error:', message)
    notifyDiscord({
      title: '🔴 Billing portal session failed',
      color: DISCORD_COLOR.error,
      fields: [
        { name: 'User', value: userId, inline: true },
        { name: 'Error', value: message },
      ],
    })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function handlePolarWebhook(req: NextRequest): Promise<NextResponse> {
  const body = await req.text()
  const headers = {
    'webhook-id': req.headers.get('webhook-id') ?? '',
    'webhook-timestamp': req.headers.get('webhook-timestamp') ?? '',
    'webhook-signature': req.headers.get('webhook-signature') ?? '',
  }

  let event
  try {
    event = validateEvent(body, headers, env.POLAR_WEBHOOK_SECRET)
  } catch (err) {
    if (err instanceof WebhookVerificationError) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
    }
    throw err
  }

  await handleWebhookEvent(event)

  return NextResponse.json({ ok: true })
}
