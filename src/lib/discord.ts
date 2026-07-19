// Fire-and-forget Discord webhook notifier. Optional like posthog.ts — never
// a hard dependency, silently no-ops if DISCORD_WEBHOOK_URL isn't set. Uses
// raw process.env (not config/env.ts's zod schema) so both the Next.js app
// and the worker process can import this without pulling in the other's
// required env vars — same reasoning as lib/redis.ts being shared.
let warned = false

function getWebhookUrl(): string | null {
  const url = process.env.DISCORD_WEBHOOK_URL
  if (!url) {
    if (!warned) {
      console.warn('[discord] DISCORD_WEBHOOK_URL not set — notifications disabled')
      warned = true
    }
    return null
  }
  return url
}

export const DISCORD_COLOR = {
  success: 0x57f287, // new user / good news
  money: 0xfee75c, // subscription sold
  error: 0xed4245, // something broke
} as const

interface DiscordField {
  name: string
  value: string
  inline?: boolean
}

interface DiscordNotification {
  title: string
  color: number
  fields?: DiscordField[]
}

// Discord's per-field value cap is 1024 chars — error messages/stack traces
// routinely blow past that and a too-large payload gets the whole webhook
// call rejected with a 400, silently dropping the alert.
const FIELD_VALUE_LIMIT = 1000

export function notifyDiscord({ title, color, fields }: DiscordNotification): void {
  const url = getWebhookUrl()
  if (!url) return

  const truncatedFields = fields?.map((f) => ({
    ...f,
    value: f.value.length > FIELD_VALUE_LIMIT ? `${f.value.slice(0, FIELD_VALUE_LIMIT)}…` : f.value,
  }))

  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      embeds: [
        {
          title,
          color,
          fields: truncatedFields,
          timestamp: new Date().toISOString(),
          footer: { text: 'Instacap' },
        },
      ],
    }),
  })
    .then((res) => {
      if (!res.ok) console.error(`[discord] webhook responded ${res.status}`)
    })
    .catch((err) => {
      console.error('[discord] failed to send notification:', err instanceof Error ? err.message : err)
    })
}
