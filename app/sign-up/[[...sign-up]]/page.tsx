import { SignUp } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { clerkAppearance } from '@/src/lib/clerk-appearance'

export default async function SignUpPage() {
  const { userId } = await auth()
  if (userId) redirect('/dashboard')

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[#faf9f6] font-[family-name:var(--font-cc)] px-4">
      <div className="flex items-center gap-2">
        <span className="text-[13px] font-bold tracking-[0.08em] uppercase text-[#1a1917]"><span className="text-[#c1361f]">Insta</span>cap</span>
      </div>
      <SignUp appearance={clerkAppearance} fallbackRedirectUrl="/dashboard" />
    </main>
  )
}
