'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { useInventory } from '@/context/InventoryContext'
import { useConfig } from '@/context/ConfigContext'
import {
  STEEL_CATEGORIES,
  P50_CATEGORIES,
  type SteelType,
  type P50Type,
} from '@/data/extinguishers'

function QtyInput({ qty, onChange }: { qty: number; onChange: (v: number) => void }) {
  return (
    <input
      type="number"
      min="0"
      inputMode="numeric"
      className="w-16 text-right bg-white border border-gray-200 focus:border-brand-red rounded px-2 py-1.5 font-body text-sm focus:outline-none focus:ring-1 focus:ring-brand-red/20 transition-colors"
      value={qty === 0 ? '' : qty}
      placeholder="0"
      onChange={e => onChange(Math.max(0, parseInt(e.target.value) || 0))}
      onFocus={e => e.target.select()}
    />
  )
}

function InventoryColumn({
  title,
  subtitle,
  accentClass,
  headerClass,
  badgeClass,
  total,
  categories,
  types,
  inventory,
  onChange,
  showAll,
  onToggleShowAll,
}: {
  title: string
  subtitle: string
  accentClass: string
  headerClass: string
  badgeClass: string
  total: number
  categories: string[]
  types: (SteelType | P50Type)[]
  inventory: Record<string, number>
  onChange: (id: string, v: number) => void
  showAll: boolean
  onToggleShowAll: () => void
}) {
  const hasData = total > 0

  return (
    <div className={`bg-white rounded-md border-2 ${accentClass} shadow-sm overflow-hidden flex flex-col`}>
      <div className={`${headerClass} border-b px-5 py-3 flex items-center justify-between`}>
        <div>
          <h2 className="font-heading font-bold text-base uppercase text-brand-black tracking-wide">{title}</h2>
          <p className="font-body text-xs text-gray-400">{subtitle}</p>
        </div>
        {total > 0 && (
          <span className={`font-body text-xs font-semibold rounded-full px-2.5 py-1 ${badgeClass}`}>
            {total} units
          </span>
        )}
      </div>

      <div className="px-5 flex-1 overflow-y-auto" style={{ maxHeight: '55vh' }}>
        {categories.map(cat => {
          const catTypes = types.filter(t => t.category === cat)
          const visible = showAll || !hasData
            ? catTypes
            : catTypes.filter(t => (inventory[t.id] ?? 0) > 0)
          if (visible.length === 0) return null
          return (
            <div key={cat}>
              <p className="text-xs font-heading font-bold uppercase tracking-widest text-gray-400 pt-4 pb-1 border-b border-gray-100 mb-1">
                {cat}
              </p>
              {visible.map(type => (
                <div key={type.id} className="flex items-center justify-between py-1.5 gap-3">
                  <span className="font-body text-sm text-gray-700 flex-1 leading-tight">{type.label}</span>
                  <QtyInput qty={inventory[type.id] ?? 0} onChange={v => onChange(type.id, v)} />
                </div>
              ))}
            </div>
          )
        })}
        <div className="h-2" />
      </div>

      {hasData && (
        <div className="px-5 py-2.5 border-t border-gray-100">
          <button
            onClick={onToggleShowAll}
            className="font-body text-xs text-gray-400 hover:text-brand-red transition-colors"
          >
            {showAll ? '↑ Show preset items only' : '↓ Show all extinguisher types'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function CalculatorPage() {
  const router = useRouter()
  const { steelInventory, p50Inventory, setSteelQty, setP50Qty } = useInventory()
  const { steelTypes, p50Types } = useConfig()
  const [showAllSteel, setShowAllSteel] = useState(false)
  const [showAllP50, setShowAllP50] = useState(false)

  const steelTotal = Object.values(steelInventory).reduce((a, b) => a + b, 0)
  const p50Total = Object.values(p50Inventory).reduce((a, b) => a + b, 0)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header step={2} />

      <main className="flex-1 max-w-5xl mx-auto w-full px-5 py-5 flex flex-col">
        <div className="mb-4">
          <h1 className="font-heading font-black text-3xl md:text-4xl uppercase text-brand-black">
            Your Extinguisher Inventory
          </h1>
          <p className="font-body text-gray-500 mt-1 text-sm">
            Enter quantities for the extinguishers you have. P50 equivalents are pre-filled — adjust as needed.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 flex-1">
          <InventoryColumn
            title="Current Steel"
            subtitle="What you have now"
            accentClass="border-gray-200"
            headerClass="bg-gray-50"
            badgeClass="bg-gray-200 text-gray-600"
            total={steelTotal}
            categories={STEEL_CATEGORIES}
            types={steelTypes}
            inventory={steelInventory}
            onChange={setSteelQty}
            showAll={showAllSteel}
            onToggleShowAll={() => setShowAllSteel(v => !v)}
          />
          <InventoryColumn
            title="Recommended P50"
            subtitle="Pre-filled from your inventory — override as needed"
            accentClass="border-brand-red/20"
            headerClass="bg-brand-red/5"
            badgeClass="bg-brand-red/10 text-brand-red"
            total={p50Total}
            categories={P50_CATEGORIES}
            types={p50Types}
            inventory={p50Inventory}
            onChange={setP50Qty}
            showAll={showAllP50}
            onToggleShowAll={() => setShowAllP50(v => !v)}
          />
        </div>

        <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-end">
          <button className="btn-secondary" onClick={() => router.push('/')}>← Back</button>
          <button className="btn-primary text-lg px-12" onClick={() => router.push('/results')}>
            Calculate Savings →
          </button>
        </div>
      </main>
    </div>
  )
}
