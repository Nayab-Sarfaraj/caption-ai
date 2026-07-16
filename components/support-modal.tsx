'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { toast } from 'sonner'

const TYPES = [
  { id: 'bug', label: 'Report a bug' },
  { id: 'feedback', label: 'Feedback' },
  { id: 'other', label: 'Something else' },
] as const

export function SupportModal({ onClose }: { onClose: () => void }) {
  const { user } = useUser()
  const [visible, setVisible] = useState(false)
  const [type, setType] = useState<(typeof TYPES)[number]['id']>('bug')
  // Lazy init, not an effect — the modal only mounts after a click deep in
  // an already-hydrated, already-authed tree, so Clerk's user is resolved
  // by the time this runs. Landing-page visitors (user is null) just get ''.
  const [email, setEmail] = useState(() => user?.primaryEmailAddress?.emailAddress ?? '')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    const raf = requestAnimationFrame(() => setVisible(true))
    return () => {
      window.removeEventListener('keydown', onKey)
      cancelAnimationFrame(raf)
    }
  }, [onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, email, message }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(typeof data.error === 'string' ? data.error : 'Could not send — try again')
      setSent(true)
      toast.success("Got it — we'll get back to you.")
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send — try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={[
        'fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 font-[family-name:var(--font-cc)] transition-opacity duration-150',
        visible ? 'opacity-100' : 'opacity-0',
      ].join(' ')}
      onClick={onClose}
    >
      <div
        className={[
          'bg-white max-w-md w-full p-6 sm:p-7 space-y-5 relative transition-all duration-200',
          visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
        ].join(' ')}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-[#a39e96] hover:text-[#1a1917] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div>
          <p className="text-[11px] tracking-[0.15em] uppercase text-[#a39e96] mb-1.5">{'// Support'}</p>
          <h2 className="text-2xl font-bold tracking-wide uppercase text-[#1a1917]">Get in touch</h2>
        </div>

        {sent ? (
          <p className="text-sm text-[#6b6862]">Thanks — we&rsquo;ll follow up at {email}.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id)}
                  className={[
                    'text-xs font-medium px-2 py-2 border transition-colors',
                    type === t.id
                      ? 'border-[#c1361f] text-[#c1361f] bg-[#c1361f08]'
                      : 'border-[#14120f1f] text-[#6b6862] hover:border-[#14120f3d]',
                  ].join(' ')}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div>
              <label htmlFor="support-email" className="text-xs text-[#6b6862] block mb-1">Email</label>
              <input
                id="support-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full text-sm text-[#1a1917] border border-[#14120f1f] px-3 py-2 focus:border-[#c1361f] outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="support-message" className="text-xs text-[#6b6862] block mb-1">Message</label>
              <textarea
                id="support-message"
                required
                minLength={10}
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={type === 'bug' ? 'What happened, and what did you expect instead?' : 'What’s on your mind?'}
                className="w-full text-sm text-[#1a1917] border border-[#14120f1f] px-3 py-2 focus:border-[#c1361f] outline-none transition-colors resize-none"
              />
            </div>

            {error && <p className="text-xs text-[#c1361f]">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#c1361f] text-white text-sm font-bold px-5 py-2.5 hover:brightness-[1.08] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending…' : 'Send'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
