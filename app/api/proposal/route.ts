import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

const PROPOSAL_COLUMNS =
  'id, entry_id, status, contact_name, contact_role, site_address, num_sites, install_date, line_items, discount_pct, vat_rate, comparison_years, cover_note, valid_until, payment_terms, warranty_notes, prepared_by, reference, created_at, updated_at'

function authed(token: string | null): boolean {
  return !!process.env.EXPORT_SECRET && token === process.env.EXPORT_SECRET
}

// Fetch a lead and its proposal (if one has been started).
export async function GET(req: NextRequest) {
  if (!authed(req.nextUrl.searchParams.get('token'))) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
  const entryId = req.nextUrl.searchParams.get('entryId')
  if (!entryId) {
    return NextResponse.json({ ok: false, error: 'Missing entryId' }, { status: 400 })
  }

  const { data: entry, error: entryError } = await supabaseAdmin
    .from('event_entries')
    .select(
      'id, company, industry, saving, created_at, steel_inventory, p50_inventory, email, phone, marketing_consent, session_id, sessions(name)',
    )
    .eq('id', entryId)
    .single()
  if (entryError || !entry) {
    return NextResponse.json({ ok: false, error: 'Lead not found' }, { status: 404 })
  }

  const { data: proposal } = await supabaseAdmin
    .from('proposals')
    .select(PROPOSAL_COLUMNS)
    .eq('entry_id', entryId)
    .maybeSingle()

  return NextResponse.json({ ok: true, entry, proposal: proposal ?? null })
}

// Create or update the proposal for a lead.
export async function POST(req: Request) {
  const { proposal, token } = await req.json()
  if (!authed(token)) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
  if (!proposal?.entry_id) {
    return NextResponse.json({ ok: false, error: 'Missing entry_id' }, { status: 400 })
  }

  const row = {
    entry_id: proposal.entry_id,
    status: proposal.status === 'approved' ? 'approved' : 'draft',
    contact_name: proposal.contact_name || null,
    contact_role: proposal.contact_role || null,
    site_address: proposal.site_address || null,
    num_sites: proposal.num_sites ?? null,
    install_date: proposal.install_date || null,
    line_items: Array.isArray(proposal.line_items) ? proposal.line_items : [],
    discount_pct: proposal.discount_pct ?? 0,
    vat_rate: proposal.vat_rate ?? 20,
    comparison_years: proposal.comparison_years ?? 8,
    cover_note: proposal.cover_note || null,
    valid_until: proposal.valid_until || null,
    payment_terms: proposal.payment_terms || null,
    warranty_notes: proposal.warranty_notes || null,
    prepared_by: proposal.prepared_by || null,
    reference: proposal.reference || null,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabaseAdmin
    .from('proposals')
    .upsert(row, { onConflict: 'entry_id' })
    .select(PROPOSAL_COLUMNS)
    .single()
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, proposal: data })
}
