import type { P50Type } from '@/data/extinguishers'
import type { EventEntry } from '@/lib/eventStore'

export type ProposalStatus = 'draft' | 'approved'

// A single billable line on the quote ("checkout") — supply, install, or ancillary.
export interface LineItem {
  id: string
  description: string
  qty: number
  unit_price: number
}

export interface Proposal {
  id?: string
  entry_id: string
  status: ProposalStatus
  // Contact & site details
  contact_name?: string
  contact_role?: string
  site_address?: string
  num_sites?: number | null
  install_date?: string | null
  // The quote
  line_items?: LineItem[]
  discount_pct?: number
  vat_rate?: number
  comparison_years?: number
  // Narrative & terms
  cover_note?: string
  valid_until?: string | null
  payment_terms?: string
  warranty_notes?: string
  // Meta
  prepared_by?: string
  reference?: string
  created_at?: string
  updated_at?: string
}

export function emptyProposal(entryId: string): Proposal {
  return {
    entry_id: entryId,
    status: 'draft',
    line_items: [],
    discount_pct: 0,
    vat_rate: 20,
    comparison_years: 8,
  }
}

// Seed the quote from the P50 units the lead was recommended, at configured prices.
// Engineers edit these (and add their own lines) after a site visit.
export function seedLineItems(entry: EventEntry, p50Types: P50Type[]): LineItem[] {
  const p50 = entry.p50_inventory ?? {}
  return p50Types
    .filter(t => (p50[t.id] ?? 0) > 0)
    .map(t => ({ id: t.id, description: t.label, qty: p50[t.id], unit_price: t.clientCost }))
}

export interface QuoteTotals {
  subtotal: number
  discount: number
  net: number
  vat: number
  total: number
}

export function quoteTotals(
  items: LineItem[] = [],
  discountPct = 0,
  vatRate = 0,
): QuoteTotals {
  const subtotal = items.reduce((s, i) => s + (i.qty || 0) * (i.unit_price || 0), 0)
  const discount = subtotal * ((discountPct || 0) / 100)
  const net = subtotal - discount
  const vat = net * ((vatRate || 0) / 100)
  return { subtotal, discount, net, vat, total: net + vat }
}

// The P50 quantities the saving/forward projection should use: prefer the
// engineer's edited line items (for known P50 types), else the lead's original mix.
export function effectiveP50Inventory(
  proposal: Proposal,
  entry: EventEntry,
  p50Types: P50Type[],
): Record<string, number> {
  const items = proposal.line_items ?? []
  if (items.length === 0) return entry.p50_inventory ?? {}
  const known = new Set(p50Types.map(t => t.id))
  const inv: Record<string, number> = {}
  for (const li of items) {
    if (known.has(li.id)) inv[li.id] = (inv[li.id] ?? 0) + (li.qty || 0)
  }
  return Object.keys(inv).length > 0 ? inv : (entry.p50_inventory ?? {})
}

// Returns P50 types with the proposal discount applied to their unit price.
export function applyP50Pricing(p50Types: P50Type[], discountPct = 0): P50Type[] {
  const factor = 1 - (discountPct || 0) / 100
  return p50Types.map(t => ({ ...t, clientCost: Math.max(0, t.clientCost * factor) }))
}

export interface ProposalBundle {
  entry: EventEntry
  proposal: Proposal | null
}

export async function getProposal(entryId: string, token: string): Promise<ProposalBundle | null> {
  const res = await fetch(
    `/api/proposal?entryId=${encodeURIComponent(entryId)}&token=${encodeURIComponent(token)}`,
  )
  const json = await res.json()
  if (!json.ok) return null
  return { entry: json.entry, proposal: json.proposal ?? null }
}

export async function saveProposal(proposal: Proposal, token: string): Promise<Proposal> {
  const res = await fetch('/api/proposal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ proposal, token }),
  })
  const json = await res.json()
  if (!json.ok) throw new Error(json.error ?? 'Failed to save proposal')
  return json.proposal
}
