import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { getBrandKit, saveBrandKit } from '@/src/services/brand-kit.service'
import { brandKitSchema } from '@/src/helpers/validators'

export async function handleGetBrandKit(): Promise<NextResponse> {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const brandKit = await getBrandKit(userId)
  return NextResponse.json({
    fontFamily: brandKit?.fontFamily ?? null,
    activeColor: brandKit?.activeColor ?? null,
    textColor: brandKit?.textColor ?? null,
    accentColor: brandKit?.accentColor ?? null,
    defaultCompositionId: brandKit?.defaultCompositionId ?? null,
  })
}

export async function handleUpsertBrandKit(req: NextRequest): Promise<NextResponse> {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = brandKitSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const brandKit = await saveBrandKit(userId, parsed.data)
  return NextResponse.json({
    fontFamily: brandKit.fontFamily,
    activeColor: brandKit.activeColor,
    textColor: brandKit.textColor,
    accentColor: brandKit.accentColor,
    defaultCompositionId: brandKit.defaultCompositionId,
  })
}
