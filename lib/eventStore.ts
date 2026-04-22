const STORAGE_KEY = 'ee_event_entries'

export interface EventEntry {
  id: string
  company: string
  industry: string
  saving: number
  timestamp: number
}

function readEntries(): EventEntry[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function getEntries(): EventEntry[] {
  return readEntries()
}

export function addEntry(entry: Omit<EventEntry, 'id' | 'timestamp'>): void {
  const entries = readEntries()
  entries.push({ ...entry, id: crypto.randomUUID(), timestamp: Date.now() })
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

export function resetEntries(): void {
  localStorage.setItem(STORAGE_KEY, '[]')
  // Clear session flags so the current visitor can re-save after reset
  try {
    for (const key of Object.keys(sessionStorage)) {
      if (key.startsWith('ee_saved_')) sessionStorage.removeItem(key)
    }
  } catch { /* ignore */ }
}

export function getTotalSaving(): number {
  return readEntries().reduce((sum, e) => sum + e.saving, 0)
}

export function getLeaderboard(limit = 10): EventEntry[] {
  return readEntries()
    .sort((a, b) => b.saving - a.saving)
    .slice(0, limit)
}
