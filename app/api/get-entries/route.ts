import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!process.env.EXPORT_SECRET || token !== process.env.EXPORT_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
  const { data, error } = await supabaseAdmin
    .from('event_entries')
    .select('id, company, industry, saving, created_at, steel_inventory, p50_inventory, email, phone')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ ok: false }, { status: 500 })
  return NextResponse.json({ ok: true, data: data ?? [] })
}
