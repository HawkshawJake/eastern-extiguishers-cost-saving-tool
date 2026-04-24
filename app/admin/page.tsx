'use client'

import { useState, useEffect } from 'react'
import { Download, Lock, ChevronDown, ChevronUp, Leaf } from 'lucide-react'
import Header from '@/components/Header'
import { getAllEntries, type EventEntry } from '@/lib/eventStore'
import { STEEL_TYPES, P50_TYPES } from '@/data/extinguishers'
import { calcTotals, formatCurrency, formatPercent } from '@/lib/calculations'

function EntryDetail({ entry }: { entry: EventEntry }) {
  const steel = entry.steel_inventory ?? {}
  const p50 = entry.p50_inventory ?? {}

  const steelLines = STEEL_TYPES.filter(t => (steel[t.id] ?? 0) > 0)
  const p50Lines = P50_TYPES.filter(t => (p50[t.id] ?? 0) > 0)

  const totals = calcTotals(steel, p50, STEEL_TYPES, P50_TYPES, 8)

  if (steelLines.length === 0 && p50Lines.length === 0) {
    return (
      <p className="font-body text-sm text-gray-400 italic px-4 py-3">
        No inventory data stored (entered before this feature was added).
      </p>
    )
  }

  return (
    <div className="px-4 py-4 grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Steel inventory */}
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

      {/* P50 inventory */}
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

      {/* Key metrics */}
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

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [exportToken, setExportToken] = useState('')
  const [entries, setEntries] = useState<EventEntry[]>([])
  const [loadingEntries, setLoadingEntries] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

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

  useEffect(() => {
    if (!authed) return
    setLoadingEntries(true)
    getAllEntries().then(data => {
      setEntries(data)
      setLoadingEntries(false)
    })
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
                  <th className="text-left font-body text-xs font-semibold uppercase tracking-widest text-gray-400 px-4 py-3">
                    Time
                  </th>
                  <th className="text-left font-body text-xs font-semibold uppercase tracking-widest text-gray-400 px-4 py-3">
                    Company
                  </th>
                  <th className="text-left font-body text-xs font-semibold uppercase tracking-widest text-gray-400 px-4 py-3">
                    Industry
                  </th>
                  <th className="text-right font-body text-xs font-semibold uppercase tracking-widest text-gray-400 px-4 py-3">
                    Saving
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
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="font-body text-sm text-brand-black px-4 py-3">
                          {entry.company}
                        </td>
                        <td className="font-body text-sm text-gray-500 px-4 py-3">
                          {entry.industry}
                        </td>
                        <td className="font-heading font-bold text-sm text-brand-red text-right px-4 py-3 tabular-nums">
                          {formatCurrency(entry.saving)}
                        </td>
                        <td className="px-3 py-3 text-gray-300">
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr key={`${entry.id}-detail`} className="bg-gray-50 border-b border-gray-100">
                          <td colSpan={5}>
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
      </main>
    </div>
  )
}
