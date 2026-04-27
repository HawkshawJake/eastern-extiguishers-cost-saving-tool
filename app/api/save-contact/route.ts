import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: Request) {
  const { id, email, phone, company } = await req.json()
  if (!id || !email) {
    return NextResponse.json({ ok: false, error: 'Missing id or email' }, { status: 400 })
  }
  const { data, error } = await supabaseAdmin
    .from('event_entries')
    .update({
      email,
      phone: phone || null,
      ...(company ? { company } : {}),
    })
    .eq('id', id)
    .select('id')
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  if (!data || data.length === 0) return NextResponse.json({ ok: false, error: 'Entry not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
