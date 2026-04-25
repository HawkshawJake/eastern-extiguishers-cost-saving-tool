'use client'

import { useState, useEffect } from 'react'
import { Download, Lock, ChevronDown, ChevronUp, Leaf, Settings, Users, RotateCcw, Save, Mail } from 'lucide-react'
import Header from '@/components/Header'
import { getAllEntries, type EventEntry } from '@/lib/eventStore'
import { STEEL_TYPES, P50_TYPES } from '@/data/extinguishers'
import { useConfig } from '@/context/ConfigContext'
import { defaultSiteConfig, type SiteConfig } from '@/lib/siteConfig'
import { calcTotals, formatCurrency, formatPercent, type CalcConstants } from '@/lib/calculations'

// ─── Entry detail (expandable row) ───────────────────────────────────────────

function EntryDetail({ entry }: { entry: EventEntry }) {
  const { constants, steelTypes, p50Types } = useConfig()
  const steel = entry.steel_inventory ?? {}
  const p50 = entry.p50_inventory ?? {}

  const steelLines = steelTypes.filter(t => (steel[t.id] ?? 0) > 0)
  const p50Lines = p50Types.filter(t => (p50[t.id] ?? 0) > 0)
  const totals = calcTotals(steel, p50, steelTypes, p50Types, 8, constants)

  if (steelLines.length === 0 && p50Lines.length === 0) {
    return (
      <p className="font-body text-sm text-gray-400 italic px-4 py-3">
        No inventory data stored (entered before this feature was added).
      </p>
    )
  }

  return (
    <div className="px-4 py-4 grid grid-cols-1 md:grid-cols-4 gap-6">
      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
          Steel Extinguishers
        </p>
        {steelLines.length === 0 ? (
          <p className="font-body text-sm text-gray-400 italic">None</p>
        ) : (
          <ul className="space-y-1">
            {steelLines.map(t => (
              <li key={t.id} className="flex justify-between font-body text-sm">
                <span className="text-gray-600">{t.label}</span>
                <span className="font-semibold text-brand-black tabular-nums">×{steel[t.id]}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
          P50 Composite
        </p>
        {p50Lines.length === 0 ? (
          <p className="font-body text-sm text-gray-400 italic">None</p>
        ) : (
          <ul className="space-y-1">
            {p50Lines.map(t => (
              <li key={t.id} className="flex justify-between font-body text-sm">
                <span className="text-gray-600">{t.label}</span>
                <span className="font-semibold text-brand-black tabular-nums">×{p50[t.id]}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Contact info */}
      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
          Contact
        </p>
        {entry.email ? (
          <div className="space-y-1">
            <p className="font-body text-sm text-brand-black break-all">{entry.email}</p>
            {entry.phone && (
              <p className="font-body text-sm text-gray-500">{entry.phone}</p>
            )}
          </div>
        ) : (
          <p className="font-body text-sm text-gray-400 italic">No contact details</p>
        )}
      </div>

      <div className="space-y-2">
        <p className="font-body text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
          8-Year Summary
        </p>
        <div className="flex justify-between font-body text-sm">
          <span className="text-gray-500">Steel cost</span>
          <span className="tabular-nums text-brand-black">{formatCurrency(totals.totalSteelCost)}</span>
        </div>
        <div className="flex justify-between font-body text-sm">
          <span className="text-gray-500">P50 cost</span>
          <span className="tabular-nums text-brand-black">{formatCurrency(totals.totalP50Cost)}</span>
        </div>
        <div className="flex justify-between font-body text-sm font-semibold border-t border-gray-100 pt-2 mt-2">
          <span className="text-brand-black">Saving</span>
          <span className="tabular-nums text-brand-red">{formatCurrency(totals.saving)}</span>
        </div>
        {totals.percentSaving > 0 && (
          <p className="font-body text-xs text-gray-400">{formatPercent(totals.percentSaving)} reduction</p>
        )}
        {totals.co2Saving > 0 && (
          <div className="flex items-center gap-1 mt-2">
            <Leaf size={12} className="text-eco-green" />
            <p className="font-body text-xs text-eco-green">
              {totals.co2Saving.toFixed(1)} kg CO2e saved
            </p>
          </div>
        )}
      </div>
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
      {/* Service charges */}
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

      {/* Steel types */}
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

      {/* P50 types */}
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

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleReset}
          className="btn-secondary flex items-center gap-2"
        >
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

type Tab = 'leads' | 'settings'

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [exportToken, setExportToken] = useState('')
  const [entries, setEntries] = useState<EventEntry[]>([])
  const [loadingEntries, setLoadingEntries] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('leads')

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
      setAuthed(true)
    } else {
      setAuthError('Incorrect password')
    }
  }

  function loadEntries() {
    setLoadingEntries(true)
    getAllEntries().then(data => {
      setEntries(data)
      setLoadingEntries(false)
    })
  }

  useEffect(() => {
    if (authed) loadEntries()
  }, [authed])

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
          <button
            onClick={() => setTab('leads')}
            className={`flex items-center gap-2 px-4 py-2.5 font-body text-sm font-semibold border-b-2 -mb-px transition-colors ${
              tab === 'leads'
                ? 'border-brand-red text-brand-red'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <Users size={15} />
            Leads
            {entries.length > 0 && (
              <span className="bg-gray-100 text-gray-600 rounded-full px-1.5 py-0.5 text-xs leading-none">
                {entries.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab('settings')}
            className={`flex items-center gap-2 px-4 py-2.5 font-body text-sm font-semibold border-b-2 -mb-px transition-colors ${
              tab === 'settings'
                ? 'border-brand-red text-brand-red'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <Settings size={15} />
            Settings
          </button>
        </div>

        {/* Leads tab */}
        {tab === 'leads' && (
          <>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="font-heading font-bold text-2xl uppercase text-brand-black">
                  Event Leads
                </h1>
                {entries.length > 0 && (
                  <p className="font-body text-sm text-gray-500 mt-1">
                    {entries.length} {entries.length === 1 ? 'entry' : 'entries'} ·{' '}
                    {formatCurrency(totalSaving)} total savings identified
                  </p>
                )}
              </div>
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
                      <th className="text-right font-body text-xs font-semibold uppercase tracking-widest text-gray-400 px-4 py-3">Saving</th>
                      <th className="w-8 text-center font-body text-xs font-semibold uppercase tracking-widest text-gray-400 px-2 py-3">
                        <Mail size={13} />
                      </th>
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
                            <td className="font-heading font-bold text-sm text-brand-red text-right px-4 py-3 tabular-nums">
                              {formatCurrency(entry.saving)}
                            </td>
                            <td className="px-2 py-3 text-center">
                              {entry.email
                                ? <Mail size={13} className="text-eco-green mx-auto" />
                                : <span className="text-gray-200">—</span>
                              }
                            </td>
                            <td className="px-3 py-3 text-gray-300">
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr key={`${entry.id}-detail`} className="bg-gray-50 border-b border-gray-100">
                              <td colSpan={6}>
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
