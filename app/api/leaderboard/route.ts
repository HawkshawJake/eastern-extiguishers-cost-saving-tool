import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(req: NextRequest) {
  const limit = Number(req.nextUrl.searchParams.get('limit') ?? '10')
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabaseAdmin
    .from('event_entries')
    .select('id, company, industry, saving, created_at')
    .gte('created_at', today)
    .order('saving', { ascending: false })
    .limit(limit)
  if (error) return NextResponse.json({ ok: false }, { status: 500 })
  return NextResponse.json({ ok: true, data: data ?? [] })
}
