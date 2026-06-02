export interface EventEntry {
  id: string
  company: string
  industry: string
  saving: number
  created_at: string
  steel_inventory?: Record<string, number>
  p50_inventory?: Record<string, number>
  email?: string
  phone?: string
  marketing_consent?: boolean
  session_id?: string
  sessions?: { name: string } | null
}

export async function addEntry(
  entry: Pick<EventEntry, 'company' | 'industry' | 'saving' | 'steel_inventory' | 'p50_inventory'> & { email?: string; phone?: string; session_id?: string },
): Promise<string> {
  const res = await fetch('/api/add-entry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  })
  const json = await res.json()
  return json.id ?? ''
}

export async function updateEntryContact(
  id: string,
  contact: { email: string; phone?: string; company?: string; marketingConsent?: boolean },
): Promise<void> {
  const res = await fetch('/api/save-contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...contact }),
  })
  const json = await res.json()
  if (!json.ok) throw new Error(json.error ?? 'Failed to save contact details')
}

export async function getLeaderboard(limit = 10, sessionId?: string): Promise<EventEntry[]> {
  const params = new URLSearchParams({ limit: String(limit) })
  if (sessionId) params.set('session_id', sessionId)
  const res = await fetch(`/api/leaderboard?${params}`)
  const json = await res.json()
  return json.data ?? []
}

export async function getTotalSaving(sessionId?: string): Promise<{ total: number; count: number }> {
  const params = sessionId ? `?session_id=${encodeURIComponent(sessionId)}` : ''
  const res = await fetch(`/api/total-saving${params}`)
  const json = await res.json()
  return { total: json.total ?? 0, count: json.count ?? 0 }
}

export async function getAllEntries(token: string, sessionId?: string): Promise<EventEntry[]> {
  const url = sessionId
    ? `/api/get-entries?token=${encodeURIComponent(token)}&session_id=${encodeURIComponent(sessionId)}`
    : `/api/get-entries?token=${encodeURIComponent(token)}`
  const res = await fetch(url)
  const json = await res.json()
  return json.data ?? []
}

export async function resetEntries(token: string, sessionId?: string): Promise<void> {
  await fetch('/api/reset-entries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, ...(sessionId ? { session_id: sessionId } : {}) }),
  })
  try {
    for (const key of Object.keys(sessionStorage)) {
      if (key.startsWith('ee_') && key !== 'ee_session_id' && key !== 'ee_session_name') {
        sessionStorage.removeItem(key)
      }
    }
  } catch { /* ignore */ }
}
