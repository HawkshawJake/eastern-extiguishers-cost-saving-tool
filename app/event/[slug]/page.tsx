'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Flame } from 'lucide-react'

export default function EventEntryPage() {
  const router = useRouter()
  const params = useParams<{ slug: string }>()
  const slug = params.slug

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch(`/api/session/${slug}`)
        const json = await res.json()
        if (json.ok && json.session) {
          sessionStorage.setItem('ee_session_id', json.session.id)
          sessionStorage.setItem('ee_session_name', json.session.name)
        }
      } catch {
        // proceed without session context if lookup fails
      }
      // Clear any stale per-visitor state so the calculator starts fresh
      sessionStorage.removeItem('ee_entry_id')
      sessionStorage.removeItem('ee_lead_done')
      router.replace('/')
    }
    init()
  }, [slug, router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Flame className="text-brand-red animate-pulse" size={32} />
        <p className="font-body text-gray-400 text-sm">Loading…</p>
      </div>
    </div>
  )
}
