'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useUser } from '@clerk/nextjs'
import { toast } from 'sonner'
import { supportMessageSchema } from '@/src/helpers/validators'
import type { z } from 'zod'

const TYPES = [
  { id: 'bug', label: 'Report a bug' },
  { id: 'feedback', label: 'Feedback' },
  { id: 'other', label: 'Something else' },
] as const

type SupportFormValues = z.infer<typeof supportMessageSchema>

export function SupportModal({ onClose }: { onClose: () => void }) {
  const { user } = useUser()
  const [visible, setVisible] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<SupportFormValues>({
    resolver: zodResolver(supportMessageSchema),
    defaultValues: {
      type: 'bug',
      // Lazy default, not an effect — the modal only mounts after a click
      // deep in an already-hydrated, already-authed tree, so Clerk's user
      // is resolved by the time this runs. Landing-page visitors (user is
      // null) just get ''.
      email: user?.primaryEmailAddress?.emailAddress ?? '',
      message: '',
    },
  })

  const type = watch('type')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    const raf = requestAnimationFrame(() => setVisible(true))
    return () => {
      window.removeEventListener('keydown', onKey)
      cancelAnimationFrame(raf)
    }
  }, [onClose])

  const onSubmit = async (values: SupportFormValues) => {
    setApiError(null)
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(typeof data.error === 'string' ? data.error : 'Could not send — try again')
      setSent(true)
      toast.success("Got it — we'll get back to you.")
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Could not send — try again')
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
          <p className="text-sm text-[#6b6862]">Thanks — we&rsquo;ll follow up at {getValues('email')}.</p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="grid grid-cols-3 gap-2">
              {TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setValue('type', t.id)}
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
                placeholder="you@example.com"
                {...register('email')}
                className="w-full text-sm text-[#1a1917] border border-[#14120f1f] px-3 py-2 focus:border-[#c1361f] outline-none transition-colors"
              />
              {errors.email && <p className="text-xs text-[#c1361f] mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="support-message" className="text-xs text-[#6b6862] block mb-1">Message</label>
              <textarea
                id="support-message"
                rows={4}
                placeholder={type === 'bug' ? 'What happened, and what did you expect instead?' : 'What’s on your mind?'}
                {...register('message')}
                className="w-full text-sm text-[#1a1917] border border-[#14120f1f] px-3 py-2 focus:border-[#c1361f] outline-none transition-colors resize-none"
              />
              {errors.message && <p className="text-xs text-[#c1361f] mt-1">{errors.message.message}</p>}
            </div>

            {apiError && <p className="text-xs text-[#c1361f]">{apiError}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#c1361f] text-white text-sm font-bold px-5 py-2.5 hover:brightness-[1.08] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Sending…' : 'Send'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
