'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Download, Lock, ChevronDown, ChevronUp, Settings, Users, RotateCcw, Save,
  Mail, RefreshCw, Trash2, Plus, Copy, ArrowUpRight, Radio, Pencil, Check, X, FileText,
} from 'lucide-react'
import Header from '@/components/Header'
import EntryDetail from '@/components/EntryDetail'
import { getAllEntries, resetEntries, type EventEntry } from '@/lib/eventStore'
import { listProposals, quoteTotals, type ProposalListItem } from '@/lib/proposals'
import { useConfig } from '@/context/ConfigContext'
import { defaultSiteConfig, type SiteConfig } from '@/lib/siteConfig'
import { formatCurrency, type CalcConstants } from '@/lib/calculations'

// ─── Sessions tab ─────────────────────────────────────────────────────────────

interface Session {
  id: string
  name: string
  slug: string
  is_live: boolean
  created_at: string
  lead_count: number
}

function SessionsTab({ token }: { token: string }) {
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [saving, setSaving] = useState(false)
  const [createError, setCreateError] = useState('')
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [renamingSaving, setRenamingSaving] = useState(false)

  function loadSessions() {
    setLoading(true)
    fetch(`/api/admin/sessions?token=${token}`)
      .then(r => r.json())
      .then(json => { setSessions(json.sessions ?? []); setLoading(false) })
  }

  useEffect(() => { loadSessions() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setSaving(true)
    setCreateError('')
    const res = await fetch('/api/admin/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim(), token }),
    })
    const json = await res.json()
    setSaving(false)
    if (json.ok) {
      setSessions(prev => [json.session, ...prev])
      setNewName('')
      setCreating(false)
    } else {
      setCreateError(json.error ?? 'Failed to create session')
    }
  }

  async function handleToggleLive(session: Session) {
    setTogglingId(session.id)
    await fetch(`/api/admin/sessions/${session.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, is_live: !session.is_live }),
    })
    setSessions(prev => prev.map(s => s.id === session.id ? { ...s, is_live: !s.is_live } : s))
    setTogglingId(null)
  }

  async function handleDelete(id: string, deleteLeads: boolean) {
    setDeletingId(id)
    await fetch(`/api/admin/sessions/${id}?token=${token}&delete_leads=${deleteLeads}`, { method: 'DELETE' })
    setDeletingId(null)
    setConfirmDeleteId(null)
    setSessions(prev => prev.filter(s => s.id !== id))
  }

  function copyUrl(slug: string, id: string) {
    const url = `${window.location.origin}/event/${slug}`
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  async function handleRename(id: string) {
    if (!editName.trim()) return
    setRenamingSaving(true)
    await fetch(`/api/admin/sessions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, name: editName.trim() }),
    })
    setSessions(prev => prev.map(s => s.id === id ? { ...s, name: editName.trim() } : s))
    setRenamingSaving(false)
    setEditingId(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading font-bold text-2xl uppercase text-brand-black">Sessions</h1>
          <p className="font-body text-sm text-gray-400 mt-0.5">
            Each session generates a unique calculator link for a show or event.
          </p>
        </div>
        {!creating && (
          <button
            onClick={() => setCreating(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={15} />
            New Session
          </button>
        )}
      </div>

      {/* Create form */}
      {creating && (
        <form
          onSubmit={handleCreate}
          className="bg-white border border-gray-200 rounded-md shadow-sm px-5 py-4 mb-4 flex items-end gap-3"
        >
          <div className="flex-1">
            <label className="block font-body text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
              Session Name
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Fire Safety Expo 2026"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              autoFocus
            />
            {createError && <p className="font-body text-xs text-brand-red mt-1">{createError}</p>}
          </div>
          <button type="submit" className="btn-primary" disabled={saving || !newName.trim()}>
            {saving ? 'Creating…' : 'Create →'}
          </button>
          <button
            type="button"
            onClick={() => { setCreating(false); setNewName(''); setCreateError('') }}
            className="btn-secondary"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Sessions list */}
      {loading ? (
        <p className="font-body text-gray-400 text-center py-12">Loading…</p>
      ) : sessions.length === 0 && !creating ? (
        <div className="text-center py-16">
          <Radio className="text-gray-200 mx-auto mb-3" size={40} />
          <p className="font-body text-gray-400 mb-1">No sessions yet.</p>
          <p className="font-body text-sm text-gray-300">Create one to get a shareable calculator link.</p>
        </div>
      ) : (
        <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
          {sessions.map((session, idx) => (
            <div
              key={session.id}
              className={`px-5 py-4 flex items-center gap-4 ${idx < sessions.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              {/* Live indicator */}
              <button
                onClick={() => handleToggleLive(session)}
                disabled={togglingId === session.id}
                title={session.is_live ? 'Mark as inactive' : 'Mark as live'}
                className={`shrink-0 w-2.5 h-2.5 rounded-full transition-colors ${
                  session.is_live ? 'bg-eco-green' : 'bg-gray-300'
                } ${togglingId === session.id ? 'opacity-50' : 'hover:opacity-70'}`}
              />

              {/* Name + meta */}
              <div className="flex-1 min-w-0">
                {editingId === session.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      className="input-field py-1 text-sm flex-1"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleRename(session.id); if (e.key === 'Escape') setEditingId(null) }}
                      autoFocus
                    />
                    <button
                      onClick={() => handleRename(session.id)}
                      disabled={renamingSaving || !editName.trim()}
                      className="text-eco-green hover:opacity-70 disabled:opacity-30"
                    >
                      <Check size={15} />
                    </button>
                    <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600">
                      <X size={15} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-heading font-bold text-brand-black text-sm">{session.name}</span>
                    <span className={`text-xs font-body px-1.5 py-0.5 rounded-full ${
                      session.is_live ? 'bg-eco-light text-eco-green' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {session.is_live ? 'Live' : 'Inactive'}
                    </span>
                    <button
                      onClick={() => { setEditingId(session.id); setEditName(session.name) }}
                      className="text-gray-300 hover:text-gray-500 transition-colors"
                      title="Rename session"
                    >
                      <Pencil size={12} />
                    </button>
                  </div>
                )}
                <p className="font-body text-xs text-gray-400 mt-0.5">
                  {new Date(session.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}{' '}
                  · {session.lead_count} {session.lead_count === 1 ? 'lead' : 'leads'}
                </p>
                <p className="font-body text-xs text-gray-300 mt-0.5 truncate">
                  {typeof window !== 'undefined' ? window.location.origin : ''}/event/{session.slug}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => copyUrl(session.slug, session.id)}
                  className="btn-secondary flex items-center gap-1.5 text-xs py-1.5 px-3"
                  title="Copy event URL"
                >
                  <Copy size={12} />
                  {copiedId === session.id ? 'Copied!' : 'Copy URL'}
                </button>

                <button
                  onClick={() => router.push(`/admin/session/${session.id}`)}
                  className="btn-secondary flex items-center gap-1.5 text-xs py-1.5 px-3"
                >
                  <ArrowUpRight size={12} />
                  View Leads
                </button>

                {confirmDeleteId === session.id ? (
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-body text-xs text-gray-500">Also delete the {session.lead_count} {session.lead_count === 1 ? 'lead' : 'leads'}?</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDelete(session.id, true)}
                        disabled={!!deletingId}
                        className="font-body text-xs text-brand-red hover:underline disabled:opacity-50"
                      >
                        {deletingId === session.id ? '…' : 'Delete all'}
                      </button>
                      <span className="text-gray-300">·</span>
                      <button
                        onClick={() => handleDelete(session.id, false)}
                        disabled={!!deletingId}
                        className="font-body text-xs text-gray-500 hover:underline disabled:opacity-50"
                      >
                        Keep leads
                      </button>
                      <span className="text-gray-300">·</span>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="font-body text-xs text-gray-400 hover:underline"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(session.id)}
                    className="text-gray-200 hover:text-brand-red transition-colors p-1"
                    title="Delete session"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Proposals tab ────────────────────────────────────────────────────────────

function ProposalsTab({ token }: { token: string }) {
  const router = useRouter()
  const [proposals, setProposals] = useState<ProposalListItem[]>([])
  const [loading, setLoading] = useState(true)

  function load() {
    setLoading(true)
    listProposals(token).then(data => { setProposals(data); setLoading(false) })
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading font-bold text-2xl uppercase text-brand-black">Proposals</h1>
          <p className="font-body text-sm text-gray-400 mt-0.5">
            Saved quotes you can re-open, edit and export. Start one from any lead.
          </p>
        </div>
        <button onClick={load} disabled={loading} className="btn-secondary flex items-center gap-2">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="font-body text-gray-400 text-center py-12">Loading…</p>
      ) : proposals.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="text-gray-200 mx-auto mb-3" size={40} />
          <p className="font-body text-gray-400 mb-1">No proposals yet.</p>
          <p className="font-body text-sm text-gray-300">
            Open a lead and click the <FileText size={12} className="inline -mt-0.5" /> icon to create one.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left font-body text-xs font-semibold uppercase tracking-widest text-gray-400 px-4 py-3">Company</th>
                <th className="text-left font-body text-xs font-semibold uppercase tracking-widest text-gray-400 px-4 py-3">Reference</th>
                <th className="text-left font-body text-xs font-semibold uppercase tracking-widest text-gray-400 px-4 py-3">Status</th>
                <th className="text-right font-body text-xs font-semibold uppercase tracking-widest text-gray-400 px-4 py-3">Quote Total</th>
                <th className="text-left font-body text-xs font-semibold uppercase tracking-widest text-gray-400 px-4 py-3">Last Edited</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {proposals.map(p => {
                const total = quoteTotals(p.line_items ?? [], p.discount_pct, p.vat_rate).total
                return (
                  <tr
                    key={p.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/admin/proposal/${p.entry_id}`)}
                  >
                    <td className="font-body text-sm text-brand-black px-4 py-3">
                      {p.event_entries?.company ?? <span className="text-gray-300">—</span>}
                      {p.event_entries?.sessions?.name && (
                        <span className="block font-body text-xs text-gray-400">{p.event_entries.sessions.name}</span>
                      )}
                    </td>
                    <td className="font-body text-sm text-gray-500 px-4 py-3">
                      {p.reference || <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-body font-semibold ${
                        p.status === 'approved' ? 'bg-eco-light text-eco-green' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {p.status === 'approved' ? 'Approved' : 'Draft'}
                      </span>
                    </td>
                    <td className="font-heading font-bold text-sm text-brand-red text-right px-4 py-3 tabular-nums">
                      {total > 0 ? `£${total.toLocaleString('en-GB', { maximumFractionDigits: 0 })}` : '—'}
                    </td>
                    <td className="font-body text-xs text-gray-400 px-4 py-3 whitespace-nowrap">
                      {new Date(p.updated_at).toLocaleString('en-GB', {
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                    <td className="px-3 py-3 text-gray-300">
                      <ArrowUpRight size={16} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Settings tab ─────────────────────────────────────────────────────────────

const CONSTANT_LABELS: { key: keyof CalcConstants; label: string; unit: string }[] = [
  { key: 'annualServiceCharge',  label: 'Annual Service Charge (per unit)',        unit: '£' },
  { key: 'disposalCharge',       label: 'Steel Disposal Charge (per unit)',         unit: '£' },
  { key: 'p50UnitDisposal',      label: 'P50 Switch Disposal (per steel unit)',     unit: '£' },
  { key: 'calloutChargeSteel',   label: 'Steel Annual Engineer Callout',            unit: '£' },
  { key: 'calloutChargeP50',     label: 'P50 Installation / Replacement Callout',  unit: '£' },
  { key: 'p50InstallationCharge',label: 'P50 Per-Unit Installation Charge',        unit: '£' },
  { key: 'steelCo2PerUnit',      label: 'Steel CO2 Emissions (per unit)',           unit: 'kg' },
  { key: 'p50Co2PerUnit',        label: 'P50 CO2 Emissions (per unit)',             unit: 'kg' },
]

function SettingsTab({
  exportToken,
  onSaved,
}: {
  exportToken: string
  onSaved: () => void
}) {
  const { constants, steelTypes, p50Types, reloadConfig } = useConfig()
  const [draft, setDraft] = useState<SiteConfig>({ constants, steelTypes, p50Types })
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'ok' | 'error'>('idle')

  useEffect(() => {
    setDraft({ constants, steelTypes, p50Types })
  }, [constants, steelTypes, p50Types])

  function setConstant(key: keyof CalcConstants, value: number) {
    setDraft(prev => ({ ...prev, constants: { ...prev.constants, [key]: value } }))
  }

  function setSteelField(id: string, field: 'lifeSpan' | 'clientCost', value: number) {
    setDraft(prev => ({
      ...prev,
      steelTypes: prev.steelTypes.map(t => t.id === id ? { ...t, [field]: value } : t),
    }))
  }

  function setP50Field(id: string, field: 'lifeSpan' | 'clientCost', value: number) {
    setDraft(prev => ({
      ...prev,
      p50Types: prev.p50Types.map(t => t.id === id ? { ...t, [field]: value } : t),
    }))
  }

  function handleReset() {
    setDraft(defaultSiteConfig())
  }

  async function handleSave() {
    setSaving(true)
    setSaveStatus('idle')
    const res = await fetch('/api/save-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ config: draft, token: exportToken }),
    })
    setSaving(false)
    if (res.ok) {
      setSaveStatus('ok')
      await reloadConfig()
      onSaved()
      setTimeout(() => setSaveStatus('idle'), 3000)
    } else {
      setSaveStatus('error')
    }
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-100 px-5 py-3">
          <h2 className="font-heading font-bold text-base uppercase tracking-wide text-brand-black">
            Service Charges &amp; Constants
          </h2>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CONSTANT_LABELS.map(({ key, label, unit }) => (
            <div key={key}>
              <label className="block font-body text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
                {label}
              </label>
              <div className="flex items-center gap-2">
                <span className="font-body text-sm text-gray-500 w-5 text-right">{unit}</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="input-field text-right"
                  value={draft.constants[key]}
                  onChange={e => setConstant(key, parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-100 px-5 py-3">
          <h2 className="font-heading font-bold text-base uppercase tracking-wide text-brand-black">
            Steel Extinguisher Types
          </h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left font-body text-xs font-semibold uppercase tracking-widest text-gray-400 px-5 py-2">Type</th>
              <th className="text-right font-body text-xs font-semibold uppercase tracking-widest text-gray-400 px-3 py-2 w-32">Lifespan (yrs)</th>
              <th className="text-right font-body text-xs font-semibold uppercase tracking-widest text-gray-400 px-5 py-2 w-36">Unit Cost (£)</th>
            </tr>
          </thead>
          <tbody>
            {draft.steelTypes.map(type => (
              <tr key={type.id} className="border-b border-gray-50 last:border-0">
                <td className="font-body text-sm text-gray-700 px-5 py-2">{type.label}</td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    className="input-field text-right w-full"
                    value={type.lifeSpan}
                    onChange={e => setSteelField(type.id, 'lifeSpan', parseInt(e.target.value) || 1)}
                  />
                </td>
                <td className="px-5 py-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="input-field text-right w-full"
                    value={type.clientCost}
                    onChange={e => setSteelField(type.id, 'clientCost', parseFloat(e.target.value) || 0)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-100 px-5 py-3">
          <h2 className="font-heading font-bold text-base uppercase tracking-wide text-brand-black">
            P50 Composite Types
          </h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left font-body text-xs font-semibold uppercase tracking-widest text-gray-400 px-5 py-2">Type</th>
              <th className="text-right font-body text-xs font-semibold uppercase tracking-widest text-gray-400 px-3 py-2 w-32">Lifespan (yrs)</th>
              <th className="text-right font-body text-xs font-semibold uppercase tracking-widest text-gray-400 px-5 py-2 w-36">Unit Cost (£)</th>
            </tr>
          </thead>
          <tbody>
            {draft.p50Types.map(type => (
              <tr key={type.id} className="border-b border-gray-50 last:border-0">
                <td className="font-body text-sm text-gray-700 px-5 py-2">{type.label}</td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    className="input-field text-right w-full"
                    value={type.lifeSpan}
                    onChange={e => setP50Field(type.id, 'lifeSpan', parseInt(e.target.value) || 1)}
                  />
                </td>
                <td className="px-5 py-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="input-field text-right w-full"
                    value={type.clientCost}
                    onChange={e => setP50Field(type.id, 'clientCost', parseFloat(e.target.value) || 0)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <button onClick={handleReset} className="btn-secondary flex items-center gap-2">
          <RotateCcw size={14} />
          Reset to Defaults
        </button>
        <div className="flex items-center gap-3">
          {saveStatus === 'ok' && (
            <p className="font-body text-sm text-eco-green">Saved successfully</p>
          )}
          {saveStatus === 'error' && (
            <p className="font-body text-sm text-brand-red">Save failed — try again</p>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center gap-2"
          >
            <Save size={14} />
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main admin page ──────────────────────────────────────────────────────────

type Tab = 'sessions' | 'leads' | 'proposals' | 'settings'

export default function AdminPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [exportToken, setExportToken] = useState('')
  const [entries, setEntries] = useState<EventEntry[]>([])
  const [loadingEntries, setLoadingEntries] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('sessions')
  const [confirmReset, setConfirmReset] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError('')
    const res = await fetch('/api/admin-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    const data = await res.json()
    setAuthLoading(false)
    if (data.ok) {
      setExportToken(data.exportToken)
      sessionStorage.setItem('ee_admin_token', data.exportToken)
      setAuthed(true)
    } else {
      setAuthError('Incorrect password')
    }
  }

  async function handleDeleteEntry(id: string) {
    setDeletingId(id)
    await fetch(`/api/delete-entry?token=${exportToken}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setDeletingId(null)
    setConfirmDeleteId(null)
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  async function handleReset() {
    if (!confirmReset) { setConfirmReset(true); return }
    setResetting(true)
    await resetEntries(exportToken)
    setConfirmReset(false)
    setResetting(false)
    loadEntries()
  }

  function loadEntries() {
    setLoadingEntries(true)
    getAllEntries(exportToken).then(data => {
      setEntries(data)
      setLoadingEntries(false)
    })
  }

  useEffect(() => {
    if (authed && tab === 'leads') loadEntries()
  }, [authed, tab]) // eslint-disable-line react-hooks/exhaustive-deps

  const totalSaving = entries.reduce((sum, e) => sum + e.saving, 0)

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-5">
          <div className="bg-white rounded-md border border-gray-200 shadow-sm p-8 w-full max-w-sm">
            <div className="flex justify-center mb-4">
              <Lock className="text-gray-400" size={28} />
            </div>
            <h1 className="font-heading font-bold text-xl uppercase text-brand-black text-center mb-6">
              Admin Access
            </h1>
            <form onSubmit={handleLogin}>
              <input
                type="password"
                className="input-field mb-3"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoFocus
              />
              {authError && (
                <p className="font-body text-sm text-brand-red mb-3">{authError}</p>
              )}
              <button
                type="submit"
                className="btn-primary w-full"
                disabled={authLoading || !password}
              >
                {authLoading ? 'Checking…' : 'Enter →'}
              </button>
            </form>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-5 py-8">

        {/* Tab bar */}
        <div className="flex items-center gap-1 mb-6 border-b border-gray-200">
          {([
            { key: 'sessions' as Tab, icon: <Radio size={15} />, label: 'Sessions', count: null as number | null },
            { key: 'leads'    as Tab, icon: <Users size={15} />,  label: 'All Leads', count: entries.length },
            { key: 'proposals' as Tab, icon: <FileText size={15} />, label: 'Proposals', count: null as number | null },
            { key: 'settings' as Tab, icon: <Settings size={15} />, label: 'Settings', count: null as number | null },
          ]).map(({ key, icon, label, count }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-2.5 font-body text-sm font-semibold border-b-2 -mb-px transition-colors ${
                tab === key
                  ? 'border-brand-red text-brand-red'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {icon}
              {label}
              {count != null && count > 0 && (
                <span className="bg-gray-100 text-gray-600 rounded-full px-1.5 py-0.5 text-xs leading-none">
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Sessions tab */}
        {tab === 'sessions' && <SessionsTab token={exportToken} />}

        {/* Proposals tab */}
        {tab === 'proposals' && <ProposalsTab token={exportToken} />}

        {/* All Leads tab */}
        {tab === 'leads' && (
          <>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="font-heading font-bold text-2xl uppercase text-brand-black">
                  All Leads
                </h1>
                {entries.length > 0 && (
                  <p className="font-body text-sm text-gray-500 mt-1">
                    {entries.length} {entries.length === 1 ? 'entry' : 'entries'} ·{' '}
                    {formatCurrency(totalSaving)} total savings identified
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={loadEntries}
                  disabled={loadingEntries}
                  className="btn-secondary flex items-center gap-2"
                >
                  <RefreshCw size={14} className={loadingEntries ? 'animate-spin' : ''} />
                  Refresh
                </button>
                {exportToken && (
                  <a
                    href={`/api/export?token=${exportToken}`}
                    download
                    className="btn-primary flex items-center gap-2 no-underline"
                  >
                    <Download size={16} />
                    Export CSV
                  </a>
                )}
                {confirmReset ? (
                  <div className="flex items-center gap-2">
                    <span className="font-body text-sm text-gray-500">Delete all entries?</span>
                    <button
                      onClick={handleReset}
                      disabled={resetting}
                      className="font-body text-sm text-brand-red hover:underline disabled:opacity-50"
                    >
                      {resetting ? 'Resetting…' : 'Yes, reset'}
                    </button>
                    <button
                      onClick={() => setConfirmReset(false)}
                      className="font-body text-sm text-gray-400 hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleReset}
                    className="btn-secondary flex items-center gap-2 text-gray-400 hover:text-brand-red"
                  >
                    <Trash2 size={14} />
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {loadingEntries ? (
              <p className="font-body text-gray-400 text-center py-12">Loading…</p>
            ) : entries.length === 0 ? (
              <p className="font-body text-gray-400 text-center py-12">No entries yet.</p>
            ) : (
              <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left font-body text-xs font-semibold uppercase tracking-widest text-gray-400 px-4 py-3">Time</th>
                      <th className="text-left font-body text-xs font-semibold uppercase tracking-widest text-gray-400 px-4 py-3">Company</th>
                      <th className="text-left font-body text-xs font-semibold uppercase tracking-widest text-gray-400 px-4 py-3">Industry</th>
                      <th className="text-left font-body text-xs font-semibold uppercase tracking-widest text-gray-400 px-4 py-3">Session</th>
                      <th className="text-right font-body text-xs font-semibold uppercase tracking-widest text-gray-400 px-4 py-3">Saving</th>
                      <th className="w-8 text-center font-body text-xs font-semibold uppercase tracking-widest text-gray-400 px-2 py-3">
                        <Mail size={13} />
                      </th>
                      <th className="w-8 text-center font-body text-xs font-semibold uppercase tracking-widest text-gray-400 px-2 py-3" title="Marketing consent">
                        Mkt
                      </th>
                      <th className="w-8" />
                      <th className="w-8" />
                      <th className="w-8" />
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map(entry => {
                      const isExpanded = expandedId === entry.id
                      return (
                        <>
                          <tr
                            key={entry.id}
                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                          >
                            <td className="font-body text-xs text-gray-400 px-4 py-3 whitespace-nowrap">
                              {new Date(entry.created_at).toLocaleString('en-GB', {
                                day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                              })}
                            </td>
                            <td className="font-body text-sm text-brand-black px-4 py-3">{entry.company}</td>
                            <td className="font-body text-sm text-gray-500 px-4 py-3">{entry.industry}</td>
                            <td className="font-body text-xs text-gray-400 px-4 py-3 whitespace-nowrap">
                              {entry.sessions?.name ?? <span className="text-gray-200">—</span>}
                            </td>
                            <td className="font-heading font-bold text-sm text-brand-red text-right px-4 py-3 tabular-nums">
                              {formatCurrency(entry.saving)}
                            </td>
                            <td className="px-2 py-3 text-center">
                              {entry.email
                                ? <Mail size={13} className="text-eco-green mx-auto" />
                                : <span className="text-gray-200">—</span>
                              }
                            </td>
                            <td className="px-2 py-3 text-center font-body text-xs">
                              {entry.marketing_consent
                                ? <span className="text-eco-green">✓</span>
                                : <span className="text-gray-200">—</span>
                              }
                            </td>
                            <td className="px-2 py-3" onClick={e => e.stopPropagation()}>
                              <button
                                onClick={() => router.push(`/admin/proposal/${entry.id}`)}
                                className="text-gray-300 hover:text-brand-red transition-colors"
                                title="Create / edit proposal"
                              >
                                <FileText size={15} />
                              </button>
                            </td>
                            <td className="px-3 py-3 text-gray-300">
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </td>
                            <td className="px-2 py-3" onClick={e => e.stopPropagation()}>
                              {confirmDeleteId === entry.id ? (
                                <div className="flex items-center gap-1 whitespace-nowrap">
                                  <button
                                    onClick={() => handleDeleteEntry(entry.id)}
                                    disabled={deletingId === entry.id}
                                    className="font-body text-xs text-brand-red hover:underline disabled:opacity-50"
                                  >
                                    {deletingId === entry.id ? '…' : 'Delete'}
                                  </button>
                                  <span className="text-gray-300">·</span>
                                  <button
                                    onClick={() => setConfirmDeleteId(null)}
                                    className="font-body text-xs text-gray-400 hover:underline"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setConfirmDeleteId(entry.id)}
                                  className="text-gray-200 hover:text-brand-red transition-colors"
                                  title="Delete entry"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr key={`${entry.id}-detail`} className="bg-gray-50 border-b border-gray-100">
                              <td colSpan={10}>
                                <EntryDetail entry={entry} />
                              </td>
                            </tr>
                          )}
                        </>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Settings tab */}
        {tab === 'settings' && (
          <>
            <h1 className="font-heading font-bold text-2xl uppercase text-brand-black mb-6">
              Calculation Settings
            </h1>
            <SettingsTab exportToken={exportToken} onSaved={() => {}} />
          </>
        )}

      </main>
    </div>
  )
}
