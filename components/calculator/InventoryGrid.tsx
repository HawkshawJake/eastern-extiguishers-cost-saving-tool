'use client'

import { useState } from 'react'
import { ChevronDown, Pencil } from 'lucide-react'
import { useInventory } from '@/context/InventoryContext'
import { useConfig } from '@/context/ConfigContext'
import { STEEL_CATEGORIES, P50_CATEGORIES } from '@/data/extinguishers'

interface Props {
  /** Hides the P50 quantity inputs and shows the auto-calculated figures instead. */
  lockP50?: boolean
}

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

function QtyRow({
  label,
  qty,
  onChange,
}: {
  label: string
  qty: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center justify-between py-2 gap-4">
      <span className="font-body text-sm text-gray-700 flex-1 leading-tight">{label}</span>
      <input
        type="number"
        min="0"
        max="50000"
        inputMode="numeric"
        className="qty-input"
        value={qty === 0 ? '' : qty}
        placeholder="0"
        onChange={e => onChange(Math.max(0, Math.min(50000, parseInt(e.target.value) || 0)))}
        onFocus={e => e.target.select()}
      />
    </div>
  )
}

function ReadOnlyRow({ label, qty }: { label: string; qty: number }) {
  return (
    <div className="flex items-center justify-between py-2 gap-4">
      <span className="font-body text-sm text-gray-500 flex-1 leading-tight">{label}</span>
      <span className="font-body text-sm font-semibold text-brand-black tabular-nums w-20 text-right pr-3">
        {qty.toLocaleString()}
      </span>
    </div>
  )
}

export default function InventoryGrid({ lockP50 = false }: Props) {
  const { steelInventory, p50Inventory, setSteelQty, setP50Qty } = useInventory()
  const { steelTypes, p50Types } = useConfig()

  const [openSteelCats, setOpenSteelCats] = useState<Set<string>>(new Set(STEEL_CATEGORIES))
  const [openP50Cats, setOpenP50Cats] = useState<Set<string>>(new Set(P50_CATEGORIES))

  const toggle = (setter: React.Dispatch<React.SetStateAction<Set<string>>>) => (cat: string) =>
    setter(prev => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })

  const toggleSteel = toggle(setOpenSteelCats)
  const toggleP50 = toggle(setOpenP50Cats)

  const steelBadge = (cat: string) =>
    steelTypes.filter(t => t.category === cat && (steelInventory[t.id] ?? 0) > 0).length

  const p50Badge = (cat: string) =>
    p50Types.filter(t => t.category === cat && (p50Inventory[t.id] ?? 0) > 0).length

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Steel column — this is where the visitor types */}
      <div className="bg-white rounded-md border-2 border-brand-red/40 shadow-sm overflow-hidden">
        <div className="bg-brand-red/5 border-b border-brand-red/10 px-5 py-3">
          <div className="flex items-center gap-2">
            <Pencil className="text-brand-red" size={14} strokeWidth={2.5} />
            <h2 className="font-heading font-bold text-lg uppercase text-brand-black tracking-wide">
              Your Current Extinguishers
            </h2>
          </div>
          <p className="font-body text-xs text-brand-red mt-0.5 font-semibold">
            Enter your quantities here
          </p>
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
              {steelTypes.filter(t => t.category === cat).map(type => (
                <QtyRow
                  key={type.id}
                  label={type.label}
                  qty={steelInventory[type.id] ?? 0}
                  onChange={v => setSteelQty(type.id, v)}
                />
              ))}
            </AccordionSection>
          ))}
        </div>
      </div>

      {/* P50 column — derived from the steel side */}
      <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-5 py-3">
          <h2 className="font-heading font-bold text-lg uppercase text-brand-black tracking-wide">
            Recommended P50 Composite
          </h2>
          <p className="font-body text-xs text-gray-400 mt-0.5">
            {lockP50
              ? 'Worked out automatically from your inventory'
              : 'Pre-filled from your inventory — override as needed'}
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
              {p50Types.filter(t => t.category === cat).map(type =>
                lockP50 ? (
                  <ReadOnlyRow key={type.id} label={type.label} qty={p50Inventory[type.id] ?? 0} />
                ) : (
                  <QtyRow
                    key={type.id}
                    label={type.label}
                    qty={p50Inventory[type.id] ?? 0}
                    onChange={v => setP50Qty(type.id, v)}
                  />
                ),
              )}
            </AccordionSection>
          ))}
        </div>
      </div>
    </div>
  )
}
