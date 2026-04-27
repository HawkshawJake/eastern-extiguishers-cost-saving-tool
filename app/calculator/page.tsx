'use client'

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

function SteelRow({
  type,
  qty,
  onChange,
}: {
  type: SteelType
  qty: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center justify-between py-1.5 gap-3">
      <span className="font-body text-sm text-gray-700 flex-1 leading-tight">{type.label}</span>
      <input
        type="number"
        min="0"
        inputMode="numeric"
        className="w-16 text-right bg-white border border-gray-200 focus:border-brand-red rounded px-2 py-1 font-body text-sm focus:outline-none focus:ring-1 focus:ring-brand-red/20 transition-colors"
        value={qty === 0 ? '' : qty}
        placeholder="0"
        onChange={e => onChange(Math.max(0, parseInt(e.target.value) || 0))}
        onFocus={e => e.target.select()}
      />
    </div>
  )
}

function P50Row({
  type,
  qty,
  onChange,
}: {
  type: P50Type
  qty: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center justify-between py-1.5 gap-3">
      <span className="font-body text-sm text-gray-700 flex-1 leading-tight">{type.label}</span>
      <input
        type="number"
        min="0"
        inputMode="numeric"
        className="w-16 text-right bg-white border border-gray-200 focus:border-brand-red rounded px-2 py-1 font-body text-sm focus:outline-none focus:ring-1 focus:ring-brand-red/20 transition-colors"
        value={qty === 0 ? '' : qty}
        placeholder="0"
        onChange={e => onChange(Math.max(0, parseInt(e.target.value) || 0))}
        onFocus={e => e.target.select()}
      />
    </div>
  )
}

function CategoryLabel({ label }: { label: string }) {
  return (
    <p className="text-xs font-heading font-bold uppercase tracking-widest text-gray-400 pt-4 pb-1 border-b border-gray-100 mb-1">
      {label}
    </p>
  )
}

export default function CalculatorPage() {
  const router = useRouter()
  const { steelInventory, p50Inventory, setSteelQty, setP50Qty } = useInventory()
  const { steelTypes, p50Types } = useConfig()

  const steelTotal = Object.values(steelInventory).reduce((a, b) => a + b, 0)
  const p50Total = Object.values(p50Inventory).reduce((a, b) => a + b, 0)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header step={2} />

      <main className="flex-1 max-w-5xl mx-auto w-full px-5 py-6">
        <div className="mb-5">
          <h1 className="font-heading font-black text-3xl md:text-4xl uppercase text-brand-black">
            Your Extinguisher Inventory
          </h1>
          <p className="font-body text-gray-500 mt-1 text-sm">
            Enter quantities for the extinguishers you have. P50 equivalents are pre-filled — adjust as needed.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Steel column */}
          <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div className="bg-gray-50 border-b border-gray-200 px-5 py-3 flex items-center justify-between">
              <div>
                <h2 className="font-heading font-bold text-base uppercase text-brand-black tracking-wide">
                  Current Steel
                </h2>
                <p className="font-body text-xs text-gray-400">What you have now</p>
              </div>
              {steelTotal > 0 && (
                <span className="bg-gray-200 text-gray-600 font-body text-xs font-semibold rounded-full px-2.5 py-1">
                  {steelTotal} units
                </span>
              )}
            </div>
            <div className="px-5 overflow-y-auto flex-1" style={{ maxHeight: '60vh' }}>
              {STEEL_CATEGORIES.map(cat => {
                const types = steelTypes.filter(t => t.category === cat)
                return (
                  <div key={cat}>
                    <CategoryLabel label={cat} />
                    {types.map(type => (
                      <SteelRow
                        key={type.id}
                        type={type}
                        qty={steelInventory[type.id] ?? 0}
                        onChange={v => setSteelQty(type.id, v)}
                      />
                    ))}
                  </div>
                )
              })}
              <div className="h-3" />
            </div>
          </div>

          {/* P50 column */}
          <div className="bg-white rounded-md border-2 border-brand-red/20 shadow-sm overflow-hidden flex flex-col">
            <div className="bg-brand-red/5 border-b border-brand-red/10 px-5 py-3 flex items-center justify-between">
              <div>
                <h2 className="font-heading font-bold text-base uppercase text-brand-black tracking-wide">
                  Recommended P50
                </h2>
                <p className="font-body text-xs text-gray-400">
                  Pre-filled from your inventory — override as needed
                </p>
              </div>
              {p50Total > 0 && (
                <span className="bg-brand-red/10 text-brand-red font-body text-xs font-semibold rounded-full px-2.5 py-1">
                  {p50Total} units
                </span>
              )}
            </div>
            <div className="px-5 overflow-y-auto flex-1" style={{ maxHeight: '60vh' }}>
              {P50_CATEGORIES.map(cat => {
                const types = p50Types.filter(t => t.category === cat)
                return (
                  <div key={cat}>
                    <CategoryLabel label={cat} />
                    {types.map(type => (
                      <P50Row
                        key={type.id}
                        type={type}
                        qty={p50Inventory[type.id] ?? 0}
                        onChange={v => setP50Qty(type.id, v)}
                      />
                    ))}
                  </div>
                )
              })}
              <div className="h-3" />
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
          <button className="btn-secondary" onClick={() => router.push('/')}>
            ← Back
          </button>
          <button
            className="btn-primary text-lg px-12"
            onClick={() => router.push('/results')}
          >
            Calculate Savings →
          </button>
        </div>
      </main>
    </div>
  )
}
