import { SignIn } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { clerkAppearance } from '@/src/lib/clerk-appearance'

export default async function SignInPage() {
  const { userId } = await auth()
  if (userId) redirect('/dashboard')

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[var(--stage)] font-[family-name:var(--font-geist-sans)] px-4">
      <div className="flex items-center gap-2">
        <span className="text-[15px] font-extrabold tracking-[-0.02em] text-[var(--ink)]"><span className="text-[var(--brand)]">Insta</span>cap</span>
      </div>
      <SignIn appearance={clerkAppearance} fallbackRedirectUrl="/dashboard" />
    </main>
  )
}
