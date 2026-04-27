import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET() {
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabaseAdmin
    .from('event_entries')
    .select('saving')
    .gte('created_at', today)
  if (error) return NextResponse.json({ ok: false }, { status: 500 })
  const rows = data ?? []
  const total = rows.reduce((sum, row) => sum + Number(row.saving), 0)
  return NextResponse.json({ ok: true, total, count: rows.length })
}
