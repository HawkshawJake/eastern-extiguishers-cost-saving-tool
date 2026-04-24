import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
  const { config, token } = await req.json()
  if (!process.env.EXPORT_SECRET || token !== process.env.EXPORT_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
  const { error } = await supabase
    .from('config')
    .upsert({ id: true, data: config })
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
