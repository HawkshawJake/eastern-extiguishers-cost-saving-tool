import type { P50Type } from '@/data/extinguishers'
import type { EventEntry } from '@/lib/eventStore'

export type ProposalStatus = 'draft' | 'approved'

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
  // Pricing
  discount_pct?: number
  price_overrides?: Record<string, number>
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

// A blank draft for a brand-new proposal on a given lead.
export function emptyProposal(entryId: string): Proposal {
  return {
    entry_id: entryId,
    status: 'draft',
    discount_pct: 0,
    price_overrides: {},
    comparison_years: 8,
  }
}

// Returns P50 types with a discount and/or per-line unit-price overrides applied.
// An override replaces the configured unit price; the discount then applies on top.
export function applyP50Pricing(
  p50Types: P50Type[],
  discountPct = 0,
  overrides: Record<string, number> = {},
): P50Type[] {
  const factor = 1 - (discountPct || 0) / 100
  return p50Types.map(t => {
    const base = overrides[t.id] ?? t.clientCost
    return { ...t, clientCost: Math.max(0, base * factor) }
  })
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
