import { SignIn } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { clerkAppearance } from '@/src/lib/clerk-appearance'

export default async function SignInPage() {
  const { userId } = await auth()
  if (userId) redirect('/dashboard')

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[#faf9f6] font-[family-name:var(--font-cc)] px-4">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full border-2 border-[#c1361f]" />
        <span className="text-[13px] font-bold tracking-[0.08em] uppercase text-[#1a1917]">Instacap</span>
      </div>
      <SignIn appearance={clerkAppearance} fallbackRedirectUrl="/dashboard" />
    </main>
  )
}
