import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getWebsiteSessionId } from '@/lib/websiteSession'
import { allowRequest } from '@/lib/rateLimit'
import { clientIp, isSameOrigin, requestBodyTooLarge } from '@/lib/requestGuard'
import {
  cleanText,
  cleanIndustry,
  cleanSaving,
  cleanSteelInventory,
  cleanP50Inventory,
  cleanEmail,
  cleanPhone,
  isUuid,
} from '@/lib/entryValidation'

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req) || requestBodyTooLarge(req)) {
    return NextResponse.json({ ok: false, error: 'Bad request' }, { status: 403 })
  }
  if (!allowRequest(`add-entry:${clientIp(req)}`, 12, 60_000)) {
    return NextResponse.json({ ok: false, error: 'Too many requests' }, { status: 429 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Bad request' }, { status: 400 })
  }

  const company = cleanText(body.company, 120)
  const saving = cleanSaving(body.saving)
  if (!company || saving === null) {
    return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 })
  }

  // Website traffic is filed against the standing Website session; the client
  // never gets to pick which session a lead lands in.
  const sessionId = body.source === 'website'
    ? await getWebsiteSessionId()
    : isUuid(body.session_id) ? body.session_id : null

  const { data, error } = await supabaseAdmin
    .from('event_entries')
    .insert({
      company,
      industry: cleanIndustry(body.industry),
      saving,
      steel_inventory: cleanSteelInventory(body.steel_inventory),
      p50_inventory: cleanP50Inventory(body.p50_inventory),
      email: cleanEmail(body.email) || null,
      phone: cleanPhone(body.phone) || null,
      session_id: sessionId,
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ ok: false, error: 'Could not save entry' }, { status: 500 })
  return NextResponse.json({ ok: true, id: data?.id ?? '' })
}
