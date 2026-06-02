import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

function checkAuth(token: string | null): boolean {
  return !!process.env.EXPORT_SECRET && token === process.env.EXPORT_SECRET
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req.nextUrl.searchParams.get('token'))) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const { data: sessions, error } = await supabaseAdmin
    .from('sessions')
    .select('id, name, slug, is_live, created_at')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })

  const { data: counts } = await supabaseAdmin
    .from('event_entries')
    .select('session_id')
    .not('session_id', 'is', null)

  const countMap: Record<string, number> = {}
  for (const row of counts ?? []) {
    if (row.session_id) countMap[row.session_id] = (countMap[row.session_id] ?? 0) + 1
  }

  const result = (sessions ?? []).map(s => ({ ...s, lead_count: countMap[s.id] ?? 0 }))
  return NextResponse.json({ ok: true, sessions: result })
}

export async function POST(req: NextRequest) {
  const { name, token } = await req.json()
  if (!checkAuth(token)) return NextResponse.json({ ok: false }, { status: 401 })
  if (!name?.trim()) return NextResponse.json({ ok: false, error: 'Name is required' }, { status: 400 })

  let slug = toSlug(name)

  const { data: existing } = await supabaseAdmin
    .from('sessions')
    .select('slug')
    .like('slug', `${slug}%`)

  const existingSlugs = (existing ?? []).map((r: { slug: string }) => r.slug)
  if (existingSlugs.includes(slug)) {
    let n = 2
    while (existingSlugs.includes(`${slug}-${n}`)) n++
    slug = `${slug}-${n}`
  }

  const { data, error } = await supabaseAdmin
    .from('sessions')
    .insert({ name: name.trim(), slug })
    .select('id, name, slug, is_live, created_at')
    .single()

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, session: { ...data, lead_count: 0 } })
}
