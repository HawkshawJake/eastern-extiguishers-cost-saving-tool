import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { defaultSiteConfig, mergeStoredConfig } from '@/lib/siteConfig'

export const dynamic = 'force-dynamic'

// Pricing and lifespan values only — the browser never talks to Supabase directly.
export async function GET() {
  try {
    const { data } = await supabaseAdmin.from('config').select('data').maybeSingle()
    return NextResponse.json({ ok: true, config: mergeStoredConfig(data?.data) })
  } catch {
    return NextResponse.json({ ok: true, config: defaultSiteConfig() })
  }
}
