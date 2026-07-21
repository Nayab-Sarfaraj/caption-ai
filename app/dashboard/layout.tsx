import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { MobileHeader } from '@/components/mobile-header'
import { PostHogIdentify } from '@/components/posthog-identify'
import { connectDB } from '@/src/lib/mongo'
import { findByClerkId } from '@/src/repositories/user.repository'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  await connectDB()
  const user = await findByClerkId(userId)

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--stage)] text-[var(--ink)] font-[family-name:var(--font-geist-sans)]">
      {user && <PostHogIdentify userId={userId} email={user.email} />}
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <Sidebar subscriptionStatus={user?.subscriptionStatus ?? 'none'} />
      </div>

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Mobile top bar */}
        <div className="lg:hidden">
          <MobileHeader subscriptionStatus={user?.subscriptionStatus ?? 'none'} />
        </div>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
