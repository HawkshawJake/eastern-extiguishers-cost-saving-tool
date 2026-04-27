'use client'

import { ArrowRight } from 'lucide-react'
import { STEEL_TO_P50_MAP, type SteelType, type P50Type } from '@/data/extinguishers'

interface Props {
  steelInventory: Record<string, number>
  p50Inventory: Record<string, number>
  steelTypes: SteelType[]
  p50Types: P50Type[]
}

export default function InventoryMapDiagram({ steelInventory, p50Inventory, steelTypes, p50Types }: Props) {
  const p50TypeMap = new Map(p50Types.map(t => [t.id, t]))
  const steelTypeMap = new Map(steelTypes.map(t => [t.id, t]))

  // Group steel ids (with qty > 0) by their target P50 id — only when the P50 also has qty > 0
  const p50Groups = new Map<string, string[]>()
  for (const t of steelTypes) {
    const qty = steelInventory[t.id] ?? 0
    const p50Id = STEEL_TO_P50_MAP[t.id]
    if (qty > 0 && p50Id && (p50Inventory[p50Id] ?? 0) > 0) {
      if (!p50Groups.has(p50Id)) p50Groups.set(p50Id, [])
      p50Groups.get(p50Id)!.push(t.id)
    }
  }

  // Steel types with no P50 equivalent, OR where the P50 qty hasn't been entered yet
  const unmapped = steelTypes.filter(t => {
    const qty = steelInventory[t.id] ?? 0
    if (qty === 0) return false
    const p50Id = STEEL_TO_P50_MAP[t.id]
    return !p50Id || (p50Inventory[p50Id] ?? 0) === 0
  })

  const hasContent = p50Groups.size > 0 || unmapped.length > 0
  if (!hasContent) return null

  return (
    <div className="space-y-4">
      {/* Column headers */}
      <div className="flex items-center gap-3">
        <div className="flex-1 text-center font-body text-xs uppercase tracking-widest text-gray-400">
          Current Steel
        </div>
        <div className="w-8" />
        <div className="flex-1 text-center font-body text-xs uppercase tracking-widest text-brand-red">
          P50 Equivalent
        </div>
      </div>

      {/* Mapped groups */}
      {Array.from(p50Groups.entries()).map(([p50Id, steelIds]) => {
        const p50Type = p50TypeMap.get(p50Id)
        const p50Qty = p50Inventory[p50Id] ?? 0
        return (
          <div key={p50Id} className="flex items-stretch gap-3">
            {/* Steel types on the left */}
            <div className="flex-1 space-y-1">
              {steelIds.map(steelId => {
                const steelType = steelTypeMap.get(steelId)!
                const qty = steelInventory[steelId] ?? 0
                return (
                  <div
                    key={steelId}
                    className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded px-3 py-2"
                  >
                    <span className="font-body text-xs text-gray-600 leading-tight">{steelType.label}</span>
                    <span className="font-heading font-bold text-sm text-brand-black ml-2 tabular-nums flex-shrink-0">
                      {qty.toLocaleString()}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Arrow */}
            <div className="flex items-center justify-center w-8 flex-shrink-0">
              <ArrowRight size={16} className="text-brand-red" />
            </div>

            {/* P50 type on the right */}
            <div className="flex-1 flex items-center justify-between bg-brand-red/5 border border-brand-red/20 rounded px-3 py-2">
              <span className="font-body text-xs text-brand-black leading-tight">{p50Type?.label}</span>
              <span className="font-heading font-bold text-sm text-brand-red ml-2 tabular-nums flex-shrink-0">
                {p50Qty.toLocaleString()}
              </span>
            </div>
          </div>
        )
      })}

      {/* Steel types with no P50 equivalent */}
      {unmapped.length > 0 && (
        <div className="pt-2 border-t border-gray-100">
          <p className="font-body text-xs text-gray-400 uppercase tracking-wide mb-2">
            Remaining Steel (No P50 Planned)
          </p>
          <div className="space-y-1">
            {unmapped.map(t => (
              <div
                key={t.id}
                className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded px-3 py-2 opacity-60"
              >
                <span className="font-body text-xs text-gray-600">{t.label}</span>
                <span className="font-heading font-bold text-sm text-gray-500 tabular-nums">
                  {(steelInventory[t.id] ?? 0).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
