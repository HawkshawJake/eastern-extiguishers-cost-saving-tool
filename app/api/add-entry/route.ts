import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { company, industry, saving, steel_inventory, p50_inventory, email, phone } = body
  if (!company || saving == null) {
    return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 })
  }
  const { data, error } = await supabaseAdmin
    .from('event_entries')
    .insert({ company, industry, saving, steel_inventory, p50_inventory, email, phone })
    .select('id')
    .single()
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, id: data?.id ?? '' })
}
