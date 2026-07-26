import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { allowRequest } from '@/lib/rateLimit'
import { clientIp, isSameOrigin } from '@/lib/requestGuard'

function matches(supplied: unknown, expected: string): boolean {
  if (typeof supplied !== 'string') return false
  const a = Buffer.from(supplied)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return NextResponse.json({ ok: false }, { status: 403 })
  if (!allowRequest(`admin-auth:${clientIp(req)}`, 8, 300_000)) {
    return NextResponse.json({ ok: false }, { status: 429 })
  }

  const { password } = await req.json().catch(() => ({ password: null }))
  if (!process.env.ADMIN_PASSWORD || !matches(password, process.env.ADMIN_PASSWORD)) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
  return NextResponse.json({ ok: true, exportToken: process.env.EXPORT_SECRET })
}
