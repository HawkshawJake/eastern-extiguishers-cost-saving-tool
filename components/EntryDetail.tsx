'use client'

import { Leaf } from 'lucide-react'
import { useConfig } from '@/context/ConfigContext'
import { calcTotals, formatCurrency, formatPercent } from '@/lib/calculations'
import type { EventEntry } from '@/lib/eventStore'

export default function EntryDetail({ entry }: { entry: EventEntry }) {
  const { constants, steelTypes, p50Types } = useConfig()
  const steel = entry.steel_inventory ?? {}
  const p50 = entry.p50_inventory ?? {}

  const steelLines = steelTypes.filter(t => (steel[t.id] ?? 0) > 0)
  const p50Lines = p50Types.filter(t => (p50[t.id] ?? 0) > 0)
  const totals = calcTotals(steel, p50, steelTypes, p50Types, 8, constants)

  if (steelLines.length === 0 && p50Lines.length === 0) {
    return (
      <p className="font-body text-sm text-gray-400 italic px-4 py-3">
        No inventory data stored (entered before this feature was added).
      </p>
    )
  }

  return (
    <div className="px-4 py-4 grid grid-cols-1 md:grid-cols-4 gap-6">
      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
          Steel Extinguishers
        </p>
        {steelLines.length === 0 ? (
          <p className="font-body text-sm text-gray-400 italic">None</p>
        ) : (
          <ul className="space-y-1">
            {steelLines.map(t => (
              <li key={t.id} className="flex justify-between font-body text-sm">
                <span className="text-gray-600">{t.label}</span>
                <span className="font-semibold text-brand-black tabular-nums">×{steel[t.id]}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
          P50 Composite
        </p>
        {p50Lines.length === 0 ? (
          <p className="font-body text-sm text-gray-400 italic">None</p>
        ) : (
          <ul className="space-y-1">
            {p50Lines.map(t => (
              <li key={t.id} className="flex justify-between font-body text-sm">
                <span className="text-gray-600">{t.label}</span>
                <span className="font-semibold text-brand-black tabular-nums">×{p50[t.id]}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
          Contact
        </p>
        {entry.email ? (
          <div className="space-y-1">
            <p className="font-body text-sm text-brand-black break-all">{entry.email}</p>
            {entry.phone && (
              <p className="font-body text-sm text-gray-500">{entry.phone}</p>
            )}
            {entry.marketing_consent && (
              <p className="font-body text-xs text-eco-green">Marketing opt-in</p>
            )}
          </div>
        ) : (
          <p className="font-body text-sm text-gray-400 italic">No contact details</p>
        )}
      </div>
      <div className="space-y-2">
        <p className="font-body text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
          8-Year Summary
        </p>
        <div className="flex justify-between font-body text-sm">
          <span className="text-gray-500">Steel cost</span>
          <span className="tabular-nums text-brand-black">{formatCurrency(totals.totalSteelCost)}</span>
        </div>
        <div className="flex justify-between font-body text-sm">
          <span className="text-gray-500">P50 cost</span>
          <span className="tabular-nums text-brand-black">{formatCurrency(totals.totalP50Cost)}</span>
        </div>
        <div className="flex justify-between font-body text-sm font-semibold border-t border-gray-100 pt-2 mt-2">
          <span className="text-brand-black">Saving</span>
          <span className="tabular-nums text-brand-red">{formatCurrency(totals.saving)}</span>
        </div>
        {totals.percentSaving > 0 && (
          <p className="font-body text-xs text-gray-400">{formatPercent(totals.percentSaving)} reduction</p>
        )}
        {totals.co2Saving > 0 && (
          <div className="flex items-center gap-1 mt-2">
            <Leaf size={12} className="text-eco-green" />
            <p className="font-body text-xs text-eco-green">
              {totals.co2Saving.toFixed(1)} kg CO2e saved
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
