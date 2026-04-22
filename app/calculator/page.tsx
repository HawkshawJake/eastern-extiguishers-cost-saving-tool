'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import Header from '@/components/Header'
import { useInventory } from '@/context/InventoryContext'
import {
  STEEL_TYPES,
  P50_TYPES,
  STEEL_CATEGORIES,
  P50_CATEGORIES,
  type SteelType,
  type P50Type,
} from '@/data/extinguishers'

function AccordionSection({
  category,
  badge,
  isOpen,
  onToggle,
  children,
}: {
  category: string
  badge?: number
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-heading font-bold uppercase tracking-widest text-gray-400">
            {category}
          </span>
          {badge !== undefined && badge > 0 && (
            <span className="bg-brand-red text-white rounded-full px-1.5 py-0.5 text-xs font-body font-semibold leading-none">
              {badge}
            </span>
          )}
        </div>
        <ChevronDown
          size={14}
          className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && <div className="pb-2">{children}</div>}
    </div>
  )
}

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
    <div className="flex items-center justify-between py-2 gap-4">
      <span className="font-body text-sm text-gray-700 flex-1 leading-tight">{type.label}</span>
      <input
        type="number"
        min="0"
        inputMode="numeric"
        className="qty-input"
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
    <div className="flex items-center justify-between py-2 gap-4">
      <div className="flex-1">
        <p className="font-body text-sm text-gray-700 leading-tight">{type.label}</p>
        <p className="font-body text-xs text-gray-400">£{type.clientCost.toFixed(2)} / unit</p>
      </div>
      <input
        type="number"
        min="0"
        inputMode="numeric"
        className="qty-input"
        value={qty === 0 ? '' : qty}
        placeholder="0"
        onChange={e => onChange(Math.max(0, parseInt(e.target.value) || 0))}
        onFocus={e => e.target.select()}
      />
    </div>
  )
}

export default function CalculatorPage() {
  const router = useRouter()
  const { steelInventory, p50Inventory, setSteelQty, setP50Qty } = useInventory()

  // All categories open by default
  const [openSteelCats, setOpenSteelCats] = useState<Set<string>>(new Set(STEEL_CATEGORIES))
  const [openP50Cats, setOpenP50Cats] = useState<Set<string>>(new Set(P50_CATEGORIES))

  const toggleSteel = (cat: string) =>
    setOpenSteelCats(prev => {
      const s = new Set(prev)
      s.has(cat) ? s.delete(cat) : s.add(cat)
      return s
    })

  const toggleP50 = (cat: string) =>
    setOpenP50Cats(prev => {
      const s = new Set(prev)
      s.has(cat) ? s.delete(cat) : s.add(cat)
      return s
    })

  const steelBadge = (cat: string) =>
    STEEL_TYPES.filter(t => t.category === cat && (steelInventory[t.id] ?? 0) > 0).length

  const p50Badge = (cat: string) =>
    P50_TYPES.filter(t => t.category === cat && (p50Inventory[t.id] ?? 0) > 0).length

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header step={2} />

      <main className="flex-1 max-w-5xl mx-auto w-full px-5 py-8">
        <div className="mb-6">
          <h1 className="font-heading font-black text-3xl md:text-4xl uppercase text-brand-black">
            Your Extinguisher Inventory
          </h1>
          <p className="font-body text-gray-500 mt-1">
            Enter quantities for the extinguishers you have. P50 equivalents are pre-filled —
            adjust as needed.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Steel column */}
          <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-5 py-3">
              <h2 className="font-heading font-bold text-lg uppercase text-brand-black tracking-wide">
                Current Steel Extinguishers
              </h2>
              <p className="font-body text-xs text-gray-400 mt-0.5">What you have now</p>
            </div>
            <div className="px-5 py-1">
              {STEEL_CATEGORIES.map(cat => (
                <AccordionSection
                  key={cat}
                  category={cat}
                  badge={steelBadge(cat)}
                  isOpen={openSteelCats.has(cat)}
                  onToggle={() => toggleSteel(cat)}
                >
                  {STEEL_TYPES.filter(t => t.category === cat).map(type => (
                    <SteelRow
                      key={type.id}
                      type={type}
                      qty={steelInventory[type.id] ?? 0}
                      onChange={v => setSteelQty(type.id, v)}
                    />
                  ))}
                </AccordionSection>
              ))}
            </div>
          </div>

          {/* P50 column */}
          <div className="bg-white rounded-md border-2 border-brand-red/20 shadow-sm overflow-hidden">
            <div className="bg-brand-red/5 border-b border-brand-red/10 px-5 py-3">
              <h2 className="font-heading font-bold text-lg uppercase text-brand-black tracking-wide">
                Recommended P50 Composite
              </h2>
              <p className="font-body text-xs text-gray-400 mt-0.5">
                Pre-filled from your steel inventory — override as needed
              </p>
            </div>
            <div className="px-5 py-1">
              {P50_CATEGORIES.map(cat => (
                <AccordionSection
                  key={cat}
                  category={cat}
                  badge={p50Badge(cat)}
                  isOpen={openP50Cats.has(cat)}
                  onToggle={() => toggleP50(cat)}
                >
                  {P50_TYPES.filter(t => t.category === cat).map(type => (
                    <P50Row
                      key={type.id}
                      type={type}
                      qty={p50Inventory[type.id] ?? 0}
                      onChange={v => setP50Qty(type.id, v)}
                    />
                  ))}
                </AccordionSection>
              ))}
            </div>
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
              <p className="font-body text-xs text-gray-400">
                No CO2 or water P50 equivalents — speak to our team for options.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-end">
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
