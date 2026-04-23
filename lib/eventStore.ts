import { supabase } from './supabase'

export interface EventEntry {
  id: string
  company: string
  industry: string
  saving: number
  created_at: string
}

function todayPrefix(): string {
  return new Date().toISOString().split('T')[0]
}

export async function addEntry(
  entry: Pick<EventEntry, 'company' | 'industry' | 'saving'>,
): Promise<void> {
  await supabase.from('event_entries').insert(entry)
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

export async function resetEntries(): Promise<void> {
  await supabase.from('event_entries').delete().gte('created_at', todayPrefix())
  try {
    for (const key of Object.keys(sessionStorage)) {
      if (key.startsWith('ee_saved_')) sessionStorage.removeItem(key)
    }
  } catch { /* ignore */ }
}
