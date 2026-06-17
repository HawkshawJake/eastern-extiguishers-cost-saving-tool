'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Printer, ArrowLeft } from 'lucide-react'
import ProposalDocument from '@/components/ProposalDocument'
import { useConfig } from '@/context/ConfigContext'
import { getProposal, emptyProposal, type Proposal } from '@/lib/proposals'
import type { EventEntry } from '@/lib/eventStore'

export default function ProposalPrintPage() {
  const router = useRouter()
  const params = useParams<{ entryId: string }>()
  const entryId = params.entryId
  const { steelTypes, p50Types, constants } = useConfig()

  const [entry, setEntry] = useState<EventEntry | null>(null)
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = sessionStorage.getItem('ee_admin_token')
    if (!token) { router.replace('/admin'); return }
    getProposal(entryId, token).then(bundle => {
      if (!bundle) { setLoading(false); return }
      setEntry(bundle.entry)
      setProposal({ ...emptyProposal(entryId), ...(bundle.proposal ?? {}) })
      setLoading(false)
    })
  }, [entryId, router])

  if (loading) {
    return <p className="font-body text-gray-400 text-center py-20">Loading…</p>
  }
  if (!entry || !proposal) {
    return <p className="font-body text-gray-400 text-center py-20">Proposal not found.</p>
  }

  return (
    <div className="bg-gray-200 min-h-screen py-8 print:bg-white print:py-0">
      {/* Print toolbar — hidden when printing */}
      <div className="no-print max-w-[210mm] mx-auto mb-4 flex items-center justify-between px-2">
        <button
          onClick={() => router.push(`/admin/proposal/${entryId}`)}
          className="flex items-center gap-1.5 font-body text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={14} />
          Back to editor
        </button>
        <button onClick={() => window.print()} className="btn-primary flex items-center gap-2">
          <Printer size={16} />
          Save as PDF / Print
        </button>
      </div>

      <ProposalDocument
        entry={entry}
        proposal={proposal}
        steelTypes={steelTypes}
        p50Types={p50Types}
        constants={constants}
      />
    </div>
  )
}
