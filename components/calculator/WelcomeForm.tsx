'use client'

import { useInventory } from '@/context/InventoryContext'
import { INDUSTRIES, INDUSTRY_PRESETS } from '@/data/extinguishers'

interface Props {
  onStart: (mode: 'preset' | 'custom') => void
}

export default function WelcomeForm({ onStart }: Props) {
  const { company, industry, setCompany, setIndustry, applyPreset, resetInventory } = useInventory()
  const hasPreset = !!industry && Object.keys(INDUSTRY_PRESETS[industry]?.steel ?? {}).length > 0

  function handlePreset() {
    applyPreset(industry)
    onStart('preset')
  }

  function handleCustom() {
    resetInventory()
    onStart('custom')
  }

  return (
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
          maxLength={120}
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
              We&rsquo;ve already populated an average extinguisher inventory for the{' '}
              <span className="font-semibold text-brand-black">{industry}</span> sector to help you
              get started.
            </p>
          </div>
          <button className="btn-primary w-full text-lg mb-3" onClick={handlePreset}>
            Use average {industry.toLowerCase()} inventory →
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
  )
}
