import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getBrandKit } from '@/src/services/brand-kit.service'
import { BrandKitForm } from '@/components/brand-kit-form'

export default async function SettingsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const brandKit = await getBrandKit(userId)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-7 sm:py-10">
      <p className="text-[11px] tracking-[0.15em] uppercase text-[#a39e96] mb-1.5">{'// Brand kit'}</p>
      <h1 className="text-2xl font-bold tracking-wide uppercase text-[#1a1917]">Brand kit</h1>
      <p className="text-[13px] text-[#6b6862] mt-1.5">
        Set your default caption style, colors, and font. Applied automatically on every new export — override per-video anytime.
      </p>

      <div className="mt-6">
        <BrandKitForm
          initial={{
            fontFamily: brandKit?.fontFamily ?? null,
            activeColor: brandKit?.activeColor ?? null,
            textColor: brandKit?.textColor ?? null,
            accentColor: brandKit?.accentColor ?? null,
            defaultCompositionId: brandKit?.defaultCompositionId ?? null,
          }}
        />
      </div>
    </div>
  )
}
