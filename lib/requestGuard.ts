import { NextRequest } from 'next/server'

/** Best-effort client IP behind Vercel's proxy. */
export function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return req.headers.get('x-real-ip') ?? 'unknown'
}

/**
 * The calculator always runs on our own origin — directly or inside the iframe
 * we serve — so any browser POST carries a matching Origin header. Anything
 * cross-origin is rejected before it can touch the database.
 */
export function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin')
  if (!origin) return true
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host')
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}

export function requestBodyTooLarge(req: NextRequest, maxBytes = 32_000): boolean {
  const length = Number(req.headers.get('content-length') ?? '0')
  return Number.isFinite(length) && length > maxBytes
}
