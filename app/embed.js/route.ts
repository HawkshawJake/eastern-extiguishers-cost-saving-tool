import { NextRequest, NextResponse } from 'next/server'
import { EMBED_LOADER } from '@/lib/embedLoader.generated'

// The loader is meant to be run by a <script> tag, not read in a browser tab.
// Browsers label the request: 'script' for a script tag, 'document' for
// address-bar navigation. Serve the former, hide the latter.
//
// This is tidiness rather than security — the script is still readable in
// devtools, and there is nothing sensitive in it. It only stops the URL being
// pasted around as a wall of source.
export async function GET(req: NextRequest) {
  if (req.headers.get('sec-fetch-dest') === 'document') {
    return new NextResponse(null, {
      status: 404,
      headers: { 'Cache-Control': 'no-store', Vary: 'Sec-Fetch-Dest' },
    })
  }

  return new NextResponse(EMBED_LOADER, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
      Vary: 'Sec-Fetch-Dest',
    },
  })
}
