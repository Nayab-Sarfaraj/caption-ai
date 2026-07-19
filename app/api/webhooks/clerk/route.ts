export const runtime = 'nodejs'

import { headers } from 'next/headers'
import { Webhook } from 'svix'
import { upsertFromClerk } from '@/src/repositories/user.repository'
import { notifyDiscord, DISCORD_COLOR } from '@/src/lib/discord'

interface ClerkUserEvent {
  type: string
  data: {
    id: string
    email_addresses: Array<{ email_address: string }>
    first_name: string | null
    last_name: string | null
  }
}

export async function POST(req: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET
  if (!webhookSecret) {
    return new Response('Webhook secret not configured', { status: 500 })
  }

  const headerPayload = await headers()
  const svixId = headerPayload.get('svix-id')
  const svixTimestamp = headerPayload.get('svix-timestamp')
  const svixSignature = headerPayload.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Missing svix headers', { status: 400 })
  }

  const body = await req.text()

  const wh = new Webhook(webhookSecret)
  let event: ClerkUserEvent

  try {
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkUserEvent
  } catch {
    return new Response('Invalid webhook signature', { status: 400 })
  }

  if (event.type === 'user.created' || event.type === 'user.updated') {
    const { id, email_addresses, first_name, last_name } = event.data
    const email = email_addresses[0]?.email_address ?? ''
    const name = [first_name, last_name].filter(Boolean).join(' ') || 'User'

    await upsertFromClerk({ clerkId: id, email, name })

    if (event.type === 'user.created') {
      notifyDiscord({
        title: '🆕 New user signup',
        color: DISCORD_COLOR.success,
        fields: [
          { name: 'Name', value: name, inline: true },
          { name: 'Email', value: email, inline: true },
          { name: 'User ID', value: id, inline: true },
        ],
      })
    }
  }

  return new Response('OK', { status: 200 })
}
