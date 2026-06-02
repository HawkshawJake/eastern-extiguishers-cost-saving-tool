import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

function checkAuth(token: string | null): boolean {
  return !!process.env.EXPORT_SECRET && token === process.env.EXPORT_SECRET
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!checkAuth(req.nextUrl.searchParams.get('token'))) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
  const { id } = await params
  const { data, error } = await supabaseAdmin
    .from('sessions')
    .select('id, name, slug, is_live, created_at')
    .eq('id', id)
    .single()
  if (error || !data) return NextResponse.json({ ok: false }, { status: 404 })
  return NextResponse.json({ ok: true, session: data })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const body = await req.json()
  const { token, is_live, name } = body
  if (!checkAuth(token)) return NextResponse.json({ ok: false }, { status: 401 })
  const { id } = await params
  const updates: Record<string, unknown> = {}
  if (is_live !== undefined) updates.is_live = is_live
  if (name !== undefined) updates.name = name.trim()
  if (Object.keys(updates).length === 0) return NextResponse.json({ ok: true })
  const { error } = await supabaseAdmin
    .from('sessions')
    .update(updates)
    .eq('id', id)
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!checkAuth(req.nextUrl.searchParams.get('token'))) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
  const deleteLeads = req.nextUrl.searchParams.get('delete_leads') === 'true'
  const { id } = await params

  if (deleteLeads) {
    const { error: leadsError } = await supabaseAdmin
      .from('event_entries')
      .delete()
      .eq('session_id', id)
    if (leadsError) return NextResponse.json({ ok: false, error: leadsError.message }, { status: 500 })
  }

  const { error } = await supabaseAdmin
    .from('sessions')
    .delete()
    .eq('id', id)
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
