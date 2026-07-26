import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { isSameOrigin } from '@/lib/requestGuard'

export async function GET(req: NextRequest) {
  if (!isSameOrigin(req)) return NextResponse.json({ ok: false }, { status: 403 })
  const rawLimit = Number(req.nextUrl.searchParams.get('limit') ?? '10')
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(Math.floor(rawLimit), 1), 50) : 10
  const sessionId = req.nextUrl.searchParams.get('session_id')

  let query = supabaseAdmin
    .from('event_entries')
    .select('id, company, industry, saving, created_at')
    .order('saving', { ascending: false })
    .limit(limit)

  if (sessionId) {
    query = query.eq('session_id', sessionId)
  } else {
    const today = new Date().toISOString().split('T')[0]
    query = query.gte('created_at', today)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ ok: false }, { status: 500 })
  return NextResponse.json({ ok: true, data: data ?? [] })
}
