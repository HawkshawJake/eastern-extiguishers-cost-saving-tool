import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { STEEL_TYPES, P50_TYPES } from '@/data/extinguishers'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!process.env.EXPORT_SECRET || token !== process.env.EXPORT_SECRET) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { data, error } = await supabase
    .from('event_entries')
    .select('company, industry, saving, created_at, steel_inventory, p50_inventory, email, phone')
    .order('created_at', { ascending: false })

  if (error) return new NextResponse('Database error', { status: 500 })

  function summariseInventory(
    inventory: Record<string, number> | null,
    types: typeof STEEL_TYPES | typeof P50_TYPES,
  ): string {
    if (!inventory) return ''
    return types
      .filter(t => (inventory[t.id] ?? 0) > 0)
      .map(t => `${t.label} ×${inventory[t.id]}`)
      .join(', ')
  }

  const rows = [
    ['Date/Time', 'Company', 'Industry', 'Saving (£)', 'Email', 'Phone', 'Steel Extinguishers', 'P50 Extinguishers'],
    ...(data ?? []).map(e => [
      new Date(e.created_at).toLocaleString('en-GB'),
      e.company,
      e.industry,
      Math.round(e.saving).toString(),
      e.email ?? '',
      e.phone ?? '',
      summariseInventory(e.steel_inventory, STEEL_TYPES),
      summariseInventory(e.p50_inventory, P50_TYPES),
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
