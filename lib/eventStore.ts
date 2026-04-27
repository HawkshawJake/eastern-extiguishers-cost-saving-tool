import { supabase } from './supabase'

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
}

export async function addEntry(
  entry: Pick<EventEntry, 'company' | 'industry' | 'saving' | 'steel_inventory' | 'p50_inventory'> & { email?: string; phone?: string },
): Promise<string> {
  const { data } = await supabase
    .from('event_entries')
    .insert(entry)
    .select('id')
    .single()
  return data?.id ?? ''
}

export async function updateEntryContact(
  id: string,
  contact: { email: string; phone?: string; company?: string },
): Promise<void> {
  const res = await fetch('/api/save-contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...contact }),
  })
  const json = await res.json()
  if (!json.ok) throw new Error(json.error ?? 'Failed to save contact details')
}

export async function getLeaderboard(limit = 10): Promise<EventEntry[]> {
  const res = await fetch(`/api/leaderboard?limit=${limit}`)
  const json = await res.json()
  return json.data ?? []
}

export async function getTotalSaving(): Promise<number> {
  const res = await fetch('/api/total-saving')
  const json = await res.json()
  return json.total ?? 0
}

export async function getAllEntries(token: string): Promise<EventEntry[]> {
  const res = await fetch(`/api/get-entries?token=${encodeURIComponent(token)}`)
  const json = await res.json()
  return json.data ?? []
}

export async function resetEntries(token: string): Promise<void> {
  await fetch('/api/reset-entries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  })
  try {
    for (const key of Object.keys(sessionStorage)) {
      if (key.startsWith('ee_')) sessionStorage.removeItem(key)
    }
  } catch { /* ignore */ }
}
