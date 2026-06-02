import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const { data, error } = await supabaseAdmin
    .from('sessions')
    .select('id, name, slug, is_live')
    .eq('slug', slug)
    .single()
  if (error || !data) return NextResponse.json({ ok: false }, { status: 404 })
  return NextResponse.json({ ok: true, session: data })
}
