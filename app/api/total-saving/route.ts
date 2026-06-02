import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id')

  let query = supabaseAdmin
    .from('event_entries')
    .select('saving')

  if (sessionId) {
    query = query.eq('session_id', sessionId)
  } else {
    const today = new Date().toISOString().split('T')[0]
    query = query.gte('created_at', today)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ ok: false }, { status: 500 })
  const rows = data ?? []
  const total = rows.reduce((sum, row) => sum + Number(row.saving), 0)
  return NextResponse.json({ ok: true, total, count: rows.length })
}
