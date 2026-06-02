import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: NextRequest) {
  const { token, session_id } = await req.json()
  if (!process.env.EXPORT_SECRET || token !== process.env.EXPORT_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  let query = supabaseAdmin.from('event_entries').delete()
  if (session_id) {
    query = query.eq('session_id', session_id)
  } else {
    query = query.neq('id', '00000000-0000-0000-0000-000000000000')
  }

  const { error } = await query
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
