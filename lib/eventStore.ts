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

function todayPrefix(): string {
  return new Date().toISOString().split('T')[0]
}

export async function addEntry(
  entry: Pick<EventEntry, 'company' | 'industry' | 'saving' | 'steel_inventory' | 'p50_inventory'>,
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
  await supabase
    .from('event_entries')
    .update({
      email: contact.email,
      phone: contact.phone || null,
      ...(contact.company ? { company: contact.company } : {}),
    })
    .eq('id', id)
}

export async function getLeaderboard(limit = 10): Promise<EventEntry[]> {
  const { data } = await supabase
    .from('event_entries')
    .select('id, company, industry, saving, created_at')
    .gte('created_at', todayPrefix())
    .order('saving', { ascending: false })
    .limit(limit)
  return data ?? []
}

export async function getTotalSaving(): Promise<number> {
  const { data } = await supabase
    .from('event_entries')
    .select('saving')
    .gte('created_at', todayPrefix())
  return (data ?? []).reduce((sum, row) => sum + Number(row.saving), 0)
}

export async function getAllEntries(): Promise<EventEntry[]> {
  const { data } = await supabase
    .from('event_entries')
    .select('id, company, industry, saving, created_at, steel_inventory, p50_inventory, email, phone')
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function resetEntries(): Promise<void> {
  await supabase.from('event_entries').delete().gte('created_at', todayPrefix())
  try {
    for (const key of Object.keys(sessionStorage)) {
      if (key.startsWith('ee_')) sessionStorage.removeItem(key)
    }
  } catch { /* ignore */ }
}
