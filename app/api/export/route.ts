import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!process.env.EXPORT_SECRET || token !== process.env.EXPORT_SECRET) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { data, error } = await supabase
    .from('event_entries')
    .select('company, industry, saving, created_at')
    .order('created_at', { ascending: false })

  if (error) return new NextResponse('Database error', { status: 500 })

  const rows = [
    ['Date/Time', 'Company', 'Industry', 'Saving (£)'],
    ...(data ?? []).map(e => [
      new Date(e.created_at).toLocaleString('en-GB'),
      e.company,
      e.industry,
      Math.round(e.saving).toString(),
    ]),
  ]

  const csv = rows
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\r\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="eastern-extinguishers-leads.csv"',
    },
  })
}
