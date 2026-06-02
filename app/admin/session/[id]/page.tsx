'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Download, ChevronDown, ChevronUp, Mail, RefreshCw, Trash2, ArrowLeft } from 'lucide-react'
import Header from '@/components/Header'
import EntryDetail from '@/components/EntryDetail'
import { formatCurrency } from '@/lib/calculations'
import type { EventEntry } from '@/lib/eventStore'

interface Session {
  id: string
  name: string
  slug: string
  is_live: boolean
  created_at: string
}

export default function SessionPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const sessionId = params.id

  const [token, setToken] = useState('')
  const [session, setSession] = useState<Session | null>(null)
  const [entries, setEntries] = useState<EventEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadEntries = useCallback(async (tok: string) => {
    setLoading(true)
    const res = await fetch(`/api/get-entries?token=${tok}&session_id=${sessionId}`)
    const json = await res.json()
    setEntries(json.data ?? [])
    setLoading(false)
  }, [sessionId])

  useEffect(() => {
    const storedToken = sessionStorage.getItem('ee_admin_token')
    if (!storedToken) {
      router.replace('/admin')
      return
    }
    setToken(storedToken)

    async function init(tok: string) {
      const [sessionRes] = await Promise.all([
        fetch(`/api/admin/sessions/${sessionId}?token=${tok}`),
      ])
      const sessionJson = await sessionRes.json()
      if (!sessionJson.ok) {
        router.replace('/admin')
        return
      }
      setSession(sessionJson.session)
      await loadEntries(tok)
    }
    init(storedToken)
  }, [sessionId, router, loadEntries])

  async function handleDeleteEntry(id: string) {
    setDeletingId(id)
    await fetch(`/api/delete-entry?token=${token}`, {
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
    await fetch('/api/reset-entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, session_id: sessionId }),
    })
    setConfirmReset(false)
    setResetting(false)
    loadEntries(token)
  }

  const totalSaving = entries.reduce((sum, e) => sum + e.saving, 0)

  if (!session && !loading) return null

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-5 py-8">

        {/* Breadcrumb */}
        <button
          onClick={() => router.push('/admin')}
          className="flex items-center gap-1.5 font-body text-sm text-gray-400 hover:text-gray-600 transition-colors mb-6"
        >
          <ArrowLeft size={14} />
          All Sessions
        </button>

        {/* Session header */}
        {session && (
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="font-heading font-bold text-2xl uppercase text-brand-black">
                  {session.name}
                </h1>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-body font-semibold ${
                  session.is_live
                    ? 'bg-eco-light text-eco-green'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {session.is_live ? 'Live' : 'Inactive'}
                </span>
              </div>
              <p className="font-body text-sm text-gray-400">
                {new Date(session.created_at).toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </p>
              {entries.length > 0 && (
                <p className="font-body text-sm text-gray-500 mt-1">
                  {entries.length} {entries.length === 1 ? 'lead' : 'leads'} ·{' '}
                  {formatCurrency(totalSaving)} total savings identified
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => loadEntries(token)}
                disabled={loading}
                className="btn-secondary flex items-center gap-2"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
              {token && (
                <a
                  href={`/api/export?token=${token}&session_id=${sessionId}`}
                  download
                  className="btn-primary flex items-center gap-2 no-underline"
                >
                  <Download size={16} />
                  Export CSV
                </a>
              )}
              {confirmReset ? (
                <div className="flex items-center gap-2">
                  <span className="font-body text-sm text-gray-500">Clear all leads?</span>
                  <button
                    onClick={handleReset}
                    disabled={resetting}
                    className="font-body text-sm text-brand-red hover:underline disabled:opacity-50"
                  >
                    {resetting ? 'Clearing…' : 'Yes, clear'}
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
                  Clear Leads
                </button>
              )}
            </div>
          </div>
        )}

        {/* Leads table */}
        {loading ? (
          <p className="font-body text-gray-400 text-center py-12">Loading…</p>
        ) : entries.length === 0 ? (
          <p className="font-body text-gray-400 text-center py-12">No leads yet for this session.</p>
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
                  <th className="w-8 text-center font-body text-xs font-semibold uppercase tracking-widest text-gray-400 px-2 py-3" title="Marketing consent">
                    Mkt
                  </th>
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
                          <td colSpan={8}>
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
