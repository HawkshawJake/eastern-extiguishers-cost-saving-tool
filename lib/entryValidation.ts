import { STEEL_TYPES, P50_TYPES, INDUSTRIES } from '@/data/extinguishers'

const STEEL_IDS = new Set(STEEL_TYPES.map(t => t.id))
const P50_IDS = new Set(P50_TYPES.map(t => t.id))
const INDUSTRY_SET = new Set(INDUSTRIES)

const MAX_QTY = 50_000
const MAX_SAVING = 100_000_000

export function cleanText(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return ''
  // Drop control characters so nothing odd reaches the admin table or CSV export.
  let out = ''
  for (const char of value) {
    const code = char.codePointAt(0) ?? 0
    if (code >= 32 && code !== 127) out += char
  }
  return out.trim().slice(0, maxLength)
}

export function cleanIndustry(value: unknown): string {
  const text = cleanText(value, 60)
  return INDUSTRY_SET.has(text) ? text : 'Other'
}

export function cleanSaving(value: unknown): number | null {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n) || n < 0 || n > MAX_SAVING) return null
  return Math.round(n * 100) / 100
}

function cleanInventory(value: unknown, allowedIds: Set<string>): Record<string, number> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const out: Record<string, number> = {}
  for (const [id, qty] of Object.entries(value as Record<string, unknown>)) {
    if (!allowedIds.has(id)) continue
    const n = typeof qty === 'number' ? qty : Number(qty)
    if (!Number.isFinite(n) || n <= 0) continue
    out[id] = Math.min(Math.floor(n), MAX_QTY)
  }
  return out
}

export const cleanSteelInventory = (v: unknown) => cleanInventory(v, STEEL_IDS)
export const cleanP50Inventory = (v: unknown) => cleanInventory(v, P50_IDS)

export function cleanEmail(value: unknown): string {
  const text = cleanText(value, 160).toLowerCase()
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(text) ? text : ''
}

export function cleanPhone(value: unknown): string {
  const text = cleanText(value, 32)
  return /^[0-9+()\-.\s]{6,32}$/.test(text) ? text : ''
}

export function isUuid(value: unknown): value is string {
  return typeof value === 'string'
    && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
}
