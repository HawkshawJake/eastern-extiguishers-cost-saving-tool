'use client'

import { useRouter } from 'next/navigation'
import { Flame } from 'lucide-react'
import Header from '@/components/Header'
import DayCounter from '@/components/DayCounter'
import Leaderboard from '@/components/Leaderboard'
import { useInventory } from '@/context/InventoryContext'
import { INDUSTRIES, INDUSTRY_PRESETS } from '@/data/extinguishers'
export default function WelcomePage() {
  const router = useRouter()
  const { company, industry, setCompany, setIndustry, applyPreset, resetInventory } = useInventory()
  const hasPreset = industry && Object.keys(INDUSTRY_PRESETS[industry]?.steel ?? {}).length > 0

  function handleUsePreset() {
    applyPreset(industry)
    router.push('/calculator')
  }

  function handleCustom() {
    resetInventory()
    router.push('/calculator')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      {/* Attention-grabbing day savings counter */}
      <DayCounter />

      <main className="flex-1 px-5 py-8 md:py-10">
        <div className="max-w-4xl mx-auto">
          {/* Page heading */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-3">
              <Flame className="text-brand-red" size={32} strokeWidth={2} />
            </div>
            <h1 className="font-heading font-black text-3xl md:text-4xl uppercase text-brand-black leading-tight mb-3">
              Cost Savings Calculator
            </h1>
            <p className="text-gray-500 font-body text-base leading-relaxed max-w-md mx-auto">
              See how much your business could save by switching to P50 composite extinguishers.
            </p>
          </div>

          {/* Two-column grid: form | leaderboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Form card */}
            <div className="bg-white rounded-md border border-gray-200 shadow-sm p-6 md:p-8">
              <div className="mb-5">
                <label className="block text-xs font-body font-semibold uppercase tracking-widest text-gray-400 mb-2">
                  Company Name{' '}
                  <span className="normal-case tracking-normal font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Acme Ltd"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                />
              </div>

              <div className="mb-6">
                <label className="block text-xs font-body font-semibold uppercase tracking-widest text-gray-400 mb-2">
                  Your Industry
                </label>
                <select
                  className="input-field"
                  value={industry}
                  onChange={e => setIndustry(e.target.value)}
                >
                  <option value="">Select your industry</option>
                  {INDUSTRIES.map(ind => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
              </div>

              {hasPreset ? (
                <>
                  <div className="bg-brand-red/5 border border-brand-red/20 rounded-sm px-4 py-3 mb-4">
                    <p className="font-body text-sm text-gray-600">
                      We have typical inventory values for{' '}
                      <span className="font-semibold text-brand-black">{industry}</span>. Start
                      with those and adjust, or enter your own.
                    </p>
                  </div>
                  <button className="btn-primary w-full text-lg mb-3" onClick={handleUsePreset}>
                    Use typical {industry} values →
                  </button>
                  <button
                    className="w-full font-body text-sm text-gray-400 hover:text-brand-red transition-colors py-2"
                    onClick={handleCustom}
                  >
                    Enter my own inventory instead
                  </button>
                </>
              ) : (
                <button className="btn-primary w-full text-lg" onClick={handleCustom}>
                  Get Started →
                </button>
              )}
            </div>

            {/* Leaderboard */}
            <Leaderboard />
          </div>

        </div>
      </main>
    </div>
  )
}
