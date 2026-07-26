'use client'

import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import InventoryGrid from '@/components/calculator/InventoryGrid'

export default function CalculatorPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header step={2} />

      <main className="flex-1 max-w-5xl mx-auto w-full px-5 py-8">
        <div className="mb-6">
          <h1 className="font-heading font-black text-3xl md:text-4xl uppercase text-brand-black">
            Your Extinguisher Inventory
          </h1>
          <p className="font-body text-gray-500 mt-1">
            Enter the quantities you have now on the left. The matching P50 quantities are worked
            out for you.
          </p>
        </div>

        <InventoryGrid />

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-end">
          <button className="btn-secondary" onClick={() => router.push('/')}>
            ← Back
          </button>
          <button className="btn-primary text-lg px-12" onClick={() => router.push('/results')}>
            Calculate Savings →
          </button>
        </div>
      </main>
    </div>
  )
}
