import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { supportMessageSchema } from '@/src/helpers/validators'
import { submitSupportMessage } from '@/src/services/support.service'

// Intentionally unauthenticated — landing-page visitors (not just logged-in
// users) need to be able to report a bug or get in touch. userId is
// attached opportunistically when a session exists.
export async function handleSubmitSupportMessage(req: NextRequest): Promise<NextResponse> {
  const { userId } = await auth()

  const parsed = supportMessageSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  try {
    await submitSupportMessage({ ...parsed.data, userId: userId ?? null })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Support message submit error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
