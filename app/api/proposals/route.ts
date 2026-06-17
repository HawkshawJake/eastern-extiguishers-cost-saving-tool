import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// List all proposals (draft + approved), newest-edited first, with the lead they belong to.
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!process.env.EXPORT_SECRET || token !== process.env.EXPORT_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const { data, error } = await supabaseAdmin
    .from('proposals')
    .select(
      'id, entry_id, status, reference, prepared_by, line_items, discount_pct, vat_rate, updated_at, event_entries(company, industry, saving, sessions(name))',
    )
    .order('updated_at', { ascending: false })

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, data: data ?? [] })
}
