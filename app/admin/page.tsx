'use client'

import { useState, useEffect } from 'react'
import { Download, Lock } from 'lucide-react'
import Header from '@/components/Header'
import { getAllEntries, type EventEntry } from '@/lib/eventStore'
import { formatCurrency } from '@/lib/calculations'

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [exportToken, setExportToken] = useState('')
  const [entries, setEntries] = useState<EventEntry[]>([])
  const [loadingEntries, setLoadingEntries] = useState(false)

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
      <main className="flex-1 max-w-4xl mx-auto w-full px-5 py-8">
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
                </tr>
              </thead>
              <tbody>
                {entries.map(entry => (
                  <tr
                    key={entry.id}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
