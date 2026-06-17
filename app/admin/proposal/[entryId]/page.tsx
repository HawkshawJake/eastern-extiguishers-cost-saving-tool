'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save, Check, Printer, CircleDot } from 'lucide-react'
import Header from '@/components/Header'
import ProposalDocument from '@/components/ProposalDocument'
import { useConfig } from '@/context/ConfigContext'
import { getProposal, saveProposal, emptyProposal, type Proposal } from '@/lib/proposals'
import type { EventEntry } from '@/lib/eventStore'

function Field({
  label, children, hint,
}: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block font-body text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
        {label}
      </label>
      {children}
      {hint && <p className="font-body text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

export default function ProposalBuilderPage() {
  const router = useRouter()
  const params = useParams<{ entryId: string }>()
  const entryId = params.entryId

  const { steelTypes, p50Types, constants } = useConfig()

  const [token, setToken] = useState('')
  const [entry, setEntry] = useState<EventEntry | null>(null)
  const [proposal, setProposal] = useState<Proposal>(emptyProposal(entryId))
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle')

  const set = useCallback(<K extends keyof Proposal>(key: K, value: Proposal[K]) => {
    setProposal(prev => ({ ...prev, [key]: value }))
    setStatus('idle')
  }, [])

  function setOverride(id: string, value: string) {
    setProposal(prev => {
      const next = { ...(prev.price_overrides ?? {}) }
      if (value === '') delete next[id]
      else next[id] = parseFloat(value) || 0
      return { ...prev, price_overrides: next }
    })
    setStatus('idle')
  }

  useEffect(() => {
    const stored = sessionStorage.getItem('ee_admin_token')
    if (!stored) { router.replace('/admin'); return }
    setToken(stored)
    getProposal(entryId, stored).then(bundle => {
      if (!bundle) { setNotFound(true); setLoading(false); return }
      setEntry(bundle.entry)
      if (bundle.proposal) {
        setProposal({ ...emptyProposal(entryId), ...bundle.proposal })
      } else {
        // Seed a fresh draft with sensible defaults from the lead.
        setProposal(prev => ({
          ...prev,
          contact_name: bundle.entry.company ?? '',
        }))
      }
      setLoading(false)
    })
  }, [entryId, router])

  async function persist(nextStatus?: Proposal['status']) {
    if (!token) return
    setSaving(true)
    setStatus('idle')
    try {
      const toSave = nextStatus ? { ...proposal, status: nextStatus } : proposal
      const saved = await saveProposal(toSave, token)
      setProposal({ ...emptyProposal(entryId), ...saved })
      setStatus('saved')
      setTimeout(() => setStatus('idle'), 2500)
    } catch {
      setStatus('error')
    } finally {
      setSaving(false)
    }
  }

  function handlePrint() {
    // Save first so the print view loads the latest data, then open it.
    persist().then(() => window.open(`/admin/proposal/${entryId}/print`, '_blank'))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <p className="font-body text-gray-400 text-center py-20">Loading proposal…</p>
      </div>
    )
  }

  if (notFound || !entry) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center px-5 py-20">
          <p className="font-body text-gray-500 mb-4">This lead could not be found.</p>
          <button className="btn-secondary" onClick={() => router.push('/admin')}>← Back to admin</button>
        </main>
      </div>
    )
  }

  const p50WithQty = p50Types.filter(t => (entry.p50_inventory?.[t.id] ?? 0) > 0)
  const isApproved = proposal.status === 'approved'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-5 py-8">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 font-body text-sm text-gray-400 hover:text-gray-600 transition-colors mb-2"
            >
              <ArrowLeft size={14} />
              Back
            </button>
            <div className="flex items-center gap-3">
              <h1 className="font-heading font-bold text-2xl uppercase text-brand-black">
                Proposal · {entry.company}
              </h1>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-body font-semibold ${
                isApproved ? 'bg-eco-light text-eco-green' : 'bg-amber-50 text-amber-600'
              }`}>
                <CircleDot size={11} />
                {isApproved ? 'Approved' : 'Draft'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {status === 'saved' && <span className="font-body text-sm text-eco-green">Saved</span>}
            {status === 'error' && <span className="font-body text-sm text-brand-red">Save failed</span>}
            <button onClick={() => persist()} disabled={saving} className="btn-secondary flex items-center gap-2">
              <Save size={14} />
              {saving ? 'Saving…' : 'Save Draft'}
            </button>
            {!isApproved ? (
              <button onClick={() => persist('approved')} disabled={saving} className="btn-secondary flex items-center gap-2 text-eco-green border-eco-green hover:bg-eco-green">
                <Check size={14} />
                Mark Approved
              </button>
            ) : (
              <button onClick={() => persist('draft')} disabled={saving} className="btn-secondary flex items-center gap-2 text-amber-600 border-amber-400 hover:bg-amber-400">
                Revert to Draft
              </button>
            )}
            <button onClick={handlePrint} disabled={saving} className="btn-primary flex items-center gap-2">
              <Printer size={16} />
              Print / PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,420px)_1fr] gap-8 items-start">
          {/* ── Form ── */}
          <div className="space-y-6">
            {/* Contact & site */}
            <section className="bg-white rounded-md border border-gray-200 shadow-sm p-5 space-y-4">
              <h2 className="font-heading font-bold text-base uppercase tracking-wide text-brand-black">
                Contact &amp; Site
              </h2>
              <Field label="Contact name">
                <input className="input-field" value={proposal.contact_name ?? ''} onChange={e => set('contact_name', e.target.value)} />
              </Field>
              <Field label="Contact role">
                <input className="input-field" value={proposal.contact_role ?? ''} onChange={e => set('contact_role', e.target.value)} placeholder="e.g. Facilities Manager" />
              </Field>
              <Field label="Site address">
                <textarea className="input-field min-h-[72px]" value={proposal.site_address ?? ''} onChange={e => set('site_address', e.target.value)} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Number of sites">
                  <input type="number" min="0" className="input-field" value={proposal.num_sites ?? ''} onChange={e => set('num_sites', e.target.value === '' ? null : parseInt(e.target.value) || 0)} />
                </Field>
                <Field label="Target install date">
                  <input type="date" className="input-field" value={proposal.install_date ?? ''} onChange={e => set('install_date', e.target.value || null)} />
                </Field>
              </div>
            </section>

            {/* Pricing */}
            <section className="bg-white rounded-md border border-gray-200 shadow-sm p-5 space-y-4">
              <h2 className="font-heading font-bold text-base uppercase tracking-wide text-brand-black">
                Pricing
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Discount %" hint="Applied to all P50 unit prices">
                  <input type="number" min="0" max="100" step="0.5" className="input-field text-right" value={proposal.discount_pct ?? 0} onChange={e => set('discount_pct', parseFloat(e.target.value) || 0)} />
                </Field>
                <Field label="Comparison years">
                  <input type="number" min="1" max="20" className="input-field text-right" value={proposal.comparison_years ?? 8} onChange={e => set('comparison_years', parseInt(e.target.value) || 8)} />
                </Field>
              </div>

              {p50WithQty.length > 0 && (
                <div>
                  <p className="font-body text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
                    P50 unit price overrides
                  </p>
                  <div className="space-y-2">
                    {p50WithQty.map(t => (
                      <div key={t.id} className="flex items-center justify-between gap-3">
                        <span className="font-body text-sm text-gray-600 flex-1 truncate">{t.label}</span>
                        <span className="font-body text-xs text-gray-300">{formatGbp(t.clientCost)}</span>
                        <input
                          type="number" min="0" step="0.01"
                          className="qty-input w-24"
                          placeholder="override"
                          value={proposal.price_overrides?.[t.id] ?? ''}
                          onChange={e => setOverride(t.id, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Narrative */}
            <section className="bg-white rounded-md border border-gray-200 shadow-sm p-5 space-y-4">
              <h2 className="font-heading font-bold text-base uppercase tracking-wide text-brand-black">
                Cover Note &amp; Terms
              </h2>
              <Field label="Cover message" hint="Personalised intro shown near the top of the proposal">
                <textarea className="input-field min-h-[96px]" value={proposal.cover_note ?? ''} onChange={e => set('cover_note', e.target.value)} />
              </Field>
              <Field label="Quote valid until">
                <input type="date" className="input-field" value={proposal.valid_until ?? ''} onChange={e => set('valid_until', e.target.value || null)} />
              </Field>
              <Field label="Payment terms">
                <textarea className="input-field min-h-[60px]" value={proposal.payment_terms ?? ''} onChange={e => set('payment_terms', e.target.value)} placeholder="e.g. 30 days from invoice" />
              </Field>
              <Field label="Warranty & maintenance notes">
                <textarea className="input-field min-h-[60px]" value={proposal.warranty_notes ?? ''} onChange={e => set('warranty_notes', e.target.value)} />
              </Field>
            </section>

            {/* Meta */}
            <section className="bg-white rounded-md border border-gray-200 shadow-sm p-5 space-y-4">
              <h2 className="font-heading font-bold text-base uppercase tracking-wide text-brand-black">
                Proposal Meta
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Reference">
                  <input className="input-field" value={proposal.reference ?? ''} onChange={e => set('reference', e.target.value)} placeholder="e.g. EE-2026-014" />
                </Field>
                <Field label="Prepared by">
                  <input className="input-field" value={proposal.prepared_by ?? ''} onChange={e => set('prepared_by', e.target.value)} />
                </Field>
              </div>
            </section>
          </div>

          {/* ── Live preview ── */}
          <div className="lg:sticky lg:top-6">
            <p className="font-body text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
              Live preview
            </p>
            <div className="border border-gray-200 rounded-md overflow-hidden bg-gray-100 p-4 max-h-[calc(100vh-120px)] overflow-y-auto">
              <ProposalDocument
                entry={entry}
                proposal={proposal}
                steelTypes={steelTypes}
                p50Types={p50Types}
                constants={constants}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function formatGbp(n: number): string {
  return `£${n.toFixed(2)}`
}
