'use client'

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

  // Group steel ids (with qty > 0) by their target P50 id
  const p50Groups = new Map<string, string[]>()
  for (const t of steelTypes) {
    const qty = steelInventory[t.id] ?? 0
    const p50Id = STEEL_TO_P50_MAP[t.id]
    if (qty > 0 && p50Id) {
      if (!p50Groups.has(p50Id)) p50Groups.set(p50Id, [])
      p50Groups.get(p50Id)!.push(t.id)
    }
  }

  // Steel types with no P50 equivalent at all
  const unmapped = steelTypes.filter(t => {
    const qty = steelInventory[t.id] ?? 0
    return qty > 0 && !STEEL_TO_P50_MAP[t.id]
  })

  const hasContent = p50Groups.size > 0 || unmapped.length > 0
  if (!hasContent) return null

  return (
    <div className="space-y-2">
      {/* Column headers */}
      <div className="flex items-center gap-0 mb-3">
        <div className="flex-1 text-center font-body text-xs uppercase tracking-widest text-gray-400">
          Current Steel
        </div>
        <div className="w-10" />
        <div className="flex-1 text-center font-body text-xs uppercase tracking-widest text-brand-red">
          P50 Equivalent
        </div>
      </div>

      {/* Mapped groups */}
      {Array.from(p50Groups.entries()).map(([p50Id, steelIds]) => {
        const p50Type = p50TypeMap.get(p50Id)
        const p50Qty = p50Inventory[p50Id] ?? 0
        const isSingle = steelIds.length === 1

        return (
          <div key={p50Id} className="flex items-stretch gap-0 rounded-lg border border-gray-200 overflow-hidden">
            {/* Steel column */}
            <div className="flex-1 bg-gray-50 divide-y divide-gray-200">
              {steelIds.map(steelId => {
                const steelType = steelTypeMap.get(steelId)!
                const qty = steelInventory[steelId] ?? 0
                return (
                  <div
                    key={steelId}
                    className="flex items-center justify-between px-3 py-2.5"
                  >
                    <span className="font-body text-xs text-gray-600 leading-tight">{steelType.label}</span>
                    <span className="font-heading font-bold text-sm text-brand-black ml-2 tabular-nums flex-shrink-0">
                      {qty.toLocaleString()}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Connector */}
            <div className="w-10 flex-shrink-0 bg-white flex items-center justify-center relative">
              {isSingle ? (
                /* Single row: simple horizontal line with arrowhead */
                <div className="flex items-center w-full px-1">
                  <div className="flex-1 h-px bg-brand-red/40" />
                  <svg width="8" height="8" viewBox="0 0 8 8" className="flex-shrink-0 text-brand-red fill-brand-red">
                    <polygon points="0,0 8,4 0,8" />
                  </svg>
                </div>
              ) : (
                /* Multiple rows: vertical bracket with arrow */
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Left vertical line from top steel to bottom steel */}
                  <div className="absolute left-1 top-0 bottom-0 flex flex-col items-center">
                    <div className="flex-1 w-px bg-brand-red/40" />
                  </div>
                  {/* Horizontal line to arrow */}
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center px-1">
                    <div className="flex-1 h-px bg-brand-red/40" />
                    <svg width="8" height="8" viewBox="0 0 8 8" className="flex-shrink-0 fill-brand-red">
                      <polygon points="0,0 8,4 0,8" />
                    </svg>
                  </div>
                </div>
              )}
            </div>

            {/* P50 column */}
            <div className={`flex-1 flex items-center justify-between px-3 py-2.5 ${p50Qty > 0 ? 'bg-brand-red/5' : 'bg-white'}`}>
              <span className="font-body text-xs text-brand-black leading-tight">{p50Type?.label}</span>
              <span className={`font-heading font-bold text-sm ml-2 tabular-nums flex-shrink-0 ${p50Qty > 0 ? 'text-brand-red' : 'text-gray-300'}`}>
                {p50Qty > 0 ? p50Qty.toLocaleString() : '—'}
              </span>
            </div>
          </div>
        )
      })}

      {/* Steel types with no P50 equivalent */}
      {unmapped.length > 0 && (
        <div className="pt-3 border-t border-gray-100 mt-3">
          <p className="font-body text-xs text-gray-400 uppercase tracking-wide mb-2">
            No P50 Equivalent Available
          </p>
          <div className="rounded-lg border border-gray-200 overflow-hidden divide-y divide-gray-200">
            {unmapped.map(t => (
              <div
                key={t.id}
                className="flex items-center justify-between bg-gray-50 px-3 py-2.5 opacity-60"
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
