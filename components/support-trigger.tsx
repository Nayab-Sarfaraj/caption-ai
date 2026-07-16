'use client'

import { useState } from 'react'
import { SupportModal } from '@/components/support-modal'

export function SupportTrigger({ className }: { className?: string }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        Contact
      </button>
      {open && <SupportModal onClose={() => setOpen(false)} />}
    </>
  )
}
