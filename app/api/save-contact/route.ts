import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { allowRequest } from '@/lib/rateLimit'
import { clientIp, isSameOrigin, requestBodyTooLarge } from '@/lib/requestGuard'
import { cleanText, cleanEmail, cleanPhone, isUuid } from '@/lib/entryValidation'

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req) || requestBodyTooLarge(req, 8_000)) {
    return NextResponse.json({ ok: false, error: 'Bad request' }, { status: 403 })
  }
  if (!allowRequest(`save-contact:${clientIp(req)}`, 12, 60_000)) {
    return NextResponse.json({ ok: false, error: 'Too many requests' }, { status: 429 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Bad request' }, { status: 400 })
  }

  const { id, marketingConsent } = body
  const email = cleanEmail(body.email)
  if (!isUuid(id) || !email) {
    return NextResponse.json({ ok: false, error: 'Missing id or email' }, { status: 400 })
  }

  const company = cleanText(body.company, 120)
  const { data, error } = await supabaseAdmin
    .from('event_entries')
    .update({
      email,
      phone: cleanPhone(body.phone) || null,
      marketing_consent: marketingConsent === true,
      ...(company ? { company } : {}),
    })
    .eq('id', id)
    .select('id')

  if (error) return NextResponse.json({ ok: false, error: 'Could not save details' }, { status: 500 })
  if (!data || data.length === 0) {
    return NextResponse.json({ ok: false, error: 'Entry not found' }, { status: 404 })
  }
  return NextResponse.json({ ok: true })
}
