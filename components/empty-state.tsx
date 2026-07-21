import Link from 'next/link'
import type { ReactNode } from 'react'

function VideoIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <rect x="3" y="5" width="14" height="14" rx="3" />
      <path d="M17 10l4-2v8l-4-2z" strokeLinejoin="round" />
    </svg>
  )
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode
  title: string
  description?: string
  action?: { href: string; label: string }
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-[var(--hair)] bg-[var(--panel)] px-6 py-14">
      <div className="w-12 h-12 rounded-xl bg-[var(--brand-soft)] text-[var(--brand)] flex items-center justify-center mb-4">
        {icon ?? <VideoIcon />}
      </div>
      <p className="text-base font-semibold text-[var(--ink)]">{title}</p>
      {description && <p className="text-sm text-[var(--mute)] mt-1.5 max-w-xs leading-relaxed">{description}</p>}
      {action && (
        <Link
          href={action.href}
          className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-[var(--brand)] text-white text-sm font-bold px-4 py-2.5 hover:brightness-[1.08] transition-all"
        >
          {action.label}
        </Link>
      )}
    </div>
  )
}
