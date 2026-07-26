'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Calculator } from 'lucide-react'
import Header from '@/components/Header'
import ResultsView from '@/components/calculator/ResultsView'
import { useInventory } from '@/context/InventoryContext'
import { useConfig } from '@/context/ConfigContext'

export default function ResultsPage() {
  const router = useRouter()
  const { steelInventory, p50Inventory } = useInventory()
  const { steelTypes, p50Types } = useConfig()

  const hasData = useMemo(
    () =>
      steelTypes.some(t => (steelInventory[t.id] ?? 0) > 0) ||
      p50Types.some(t => (p50Inventory[t.id] ?? 0) > 0),
    [steelInventory, p50Inventory, steelTypes, p50Types],
  )

  if (!hasData) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header step={3} />
        <main className="flex-1 flex flex-col items-center justify-center px-5 py-12">
          <Calculator className="text-gray-300 mb-4" size={48} />
          <h2 className="font-heading font-bold text-2xl uppercase text-brand-black mb-2">
            No Inventory Entered
          </h2>
          <p className="font-body text-gray-500 text-center mb-8">
            Go back and enter your extinguisher quantities to see your savings.
          </p>
          <button className="btn-primary" onClick={() => router.push('/calculator')}>
            ← Enter Inventory
          </button>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header step={3} />
      <main className="flex-1 max-w-2xl mx-auto w-full px-5 py-8 md:py-12">
        <ResultsView
          onRecalculate={() => router.push('/calculator')}
          onStartOver={() => router.push('/')}
        />
      </main>
    </div>
  )
}
