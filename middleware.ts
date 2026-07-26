import { NextRequest, NextResponse } from 'next/server'

// Domains permitted to iframe the calculator. Set EMBED_ALLOWED_ORIGINS to a
// comma-separated list (e.g. "https://easternextinguishers.co.uk,https://www.easternextinguishers.co.uk")
// to lock embedding down to the live site. Left unset, any site may embed it.
function frameAncestors(): string {
  const configured = process.env.EMBED_ALLOWED_ORIGINS?.trim()
  if (!configured) return '*'
  const origins = configured.split(',').map(o => o.trim()).filter(Boolean)
  return origins.length ? `'self' ${origins.join(' ')}` : '*'
}

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname

  const res = NextResponse.next()
  const isEmbed = path === '/embed' || path.startsWith('/embed/')

  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()')

  if (isEmbed) {
    res.headers.set('Content-Security-Policy', `frame-ancestors ${frameAncestors()};`)
  } else {
    // Only the embed route is framable — admin and the event flow are not.
    res.headers.set('X-Frame-Options', 'DENY')
    res.headers.set('Content-Security-Policy', "frame-ancestors 'none';")
  }

  if (path.startsWith('/admin') || path.startsWith('/api/')) {
    res.headers.set('X-Robots-Tag', 'noindex, nofollow')
    res.headers.set('Cache-Control', 'no-store')
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
