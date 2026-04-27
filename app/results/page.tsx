'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { TrendingDown, Leaf, Calendar, Info, Calculator } from 'lucide-react'
import Header from '@/components/Header'
import { useInventory } from '@/context/InventoryContext'
import { useConfig } from '@/context/ConfigContext'
import {
  calcTotals,
  calcCumulativeCosts,
  findBreakEvenYear,
  formatCurrency,
  formatPercent,
} from '@/lib/calculations'
import { addEntry, updateEntryContact } from '@/lib/eventStore'
import LeadCaptureModal from '@/components/LeadCaptureModal'

const CumulativeCostChart = dynamic(
  () => import('@/components/charts/CumulativeCostChart'),
  { ssr: false, loading: () => <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">Loading chart…</div> },
)

export default function ResultsPage() {
  const router = useRouter()
  const { company, industry, steelInventory, p50Inventory } = useInventory()
  const { steelTypes, p50Types, constants } = useConfig()
  const [years, setYears] = useState(8)
  const savedRef = useRef(false)
  const entryIdRef = useRef('')
  const [showModal, setShowModal] = useState(false)

  const defaultTotals = useMemo(
    () => calcTotals(steelInventory, p50Inventory, steelTypes, p50Types, 8, constants),
    [steelInventory, p50Inventory, steelTypes, p50Types, constants],
  )

  useEffect(() => {
    const storedId = sessionStorage.getItem('ee_entry_id')
    if (storedId) entryIdRef.current = storedId
    if (savedRef.current) return
    if (defaultTotals.saving <= 0) return
    savedRef.current = true
    const key = `ee_saved_${Math.round(defaultTotals.totalSteelCost)}_${Math.round(defaultTotals.totalP50Cost)}`
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, '1')
    addEntry({
      company: company || 'Anonymous',
      industry: industry || 'Other',
      saving: defaultTotals.saving,
      steel_inventory: steelInventory,
      p50_inventory: p50Inventory,
    }).then(id => {
      if (id) {
        entryIdRef.current = id
        sessionStorage.setItem('ee_entry_id', id)
      }
    }).catch(() => {})
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (defaultTotals.saving <= 0) return
    if (sessionStorage.getItem('ee_lead_done')) return
    const timer = setTimeout(() => setShowModal(true), 3000)
    return () => clearTimeout(timer)
  }, [defaultTotals.saving])

  async function handleLeadSubmit(data: { company: string; email: string; phone: string }) {
    if (entryIdRef.current) await updateEntryContact(entryIdRef.current, data)
    sessionStorage.setItem('ee_lead_done', '1')
  }

  function handleModalDismiss() {
    sessionStorage.setItem('ee_lead_done', '1')
    setShowModal(false)
  }

  const totals = useMemo(
    () => calcTotals(steelInventory, p50Inventory, steelTypes, p50Types, years, constants),
    [steelInventory, p50Inventory, steelTypes, p50Types, years, constants],
  )

  const cumulativePoints = useMemo(
    () => calcCumulativeCosts(steelInventory, p50Inventory, steelTypes, p50Types, years, constants),
    [steelInventory, p50Inventory, steelTypes, p50Types, years, constants],
  )

  const breakEvenYear = useMemo(
    () => findBreakEvenYear(calcCumulativeCosts(steelInventory, p50Inventory, steelTypes, p50Types, 30, constants)),
    [steelInventory, p50Inventory, steelTypes, p50Types, constants],
  )

  const hasData = totals.totalSteelUnits > 0 || totals.totalP50Units > 0

  if (!hasData) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header step={3} />
        <main className="flex-1 flex flex-col items-center justify-center px-5">
          <Calculator className="text-gray-300 mb-4" size={48} />
          <h2 className="font-heading font-bold text-2xl uppercase text-brand-black mb-2">No Inventory Entered</h2>
          <p className="font-body text-gray-500 text-center mb-8">Go back and enter your extinguisher quantities to see your savings.</p>
          <button className="btn-primary" onClick={() => router.push('/calculator')}>← Enter Inventory</button>
        </main>
      </div>
    )
  }

  const contextLabel = [company, industry].filter(Boolean).join(' · ')
  const breakEvenCalendarYear = breakEvenYear !== null ? new Date().getFullYear() + Math.ceil(breakEvenYear) : null
  const breakEvenWithinRange = breakEvenYear !== null && breakEvenYear <= years

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header step={3} />

      {showModal && (
        <LeadCaptureModal
          initialCompany={company}
          saving={formatCurrency(totals.saving)}
          onSubmit={handleLeadSubmit}
          onDismiss={handleModalDismiss}
        />
      )}

      <main className="flex-1 flex flex-col px-5 py-4 max-w-7xl mx-auto w-full">
        {contextLabel && (
          <p className="font-body text-sm text-gray-400 uppercase tracking-widest mb-3 text-center">
            {contextLabel}
          </p>
        )}

        {/* Dashboard grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">

          {/* Left: hero + stats */}
          <div className="lg:col-span-2 flex flex-col gap-4">

            {/* Hero */}
            <div className="rounded-xl shadow-xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #B8241C 0%, #6B1210 100%)' }}>
              <div className="px-6 py-8 text-center">
                <p className="font-body text-white/60 uppercase tracking-widest text-xs mb-3">
                  You Could Save
                </p>
                <p className="font-heading font-black text-5xl lg:text-6xl xl:text-7xl text-white leading-none tabular-nums">
                  {formatCurrency(totals.saving)}
                </p>
                <p className="font-body text-white/70 mt-3 text-base">over {years} years</p>
                {totals.percentSaving > 0 && (
                  <p className="font-body text-white/50 text-sm mt-1">
                    {formatPercent(totals.percentSaving)} reduction on current costs
                  </p>
                )}
              </div>
              <div className="bg-black/20 px-6 py-2 flex items-center justify-center gap-2">
                <TrendingDown className="text-white/60" size={12} />
                <p className="font-body text-white/60 text-xs uppercase tracking-widest">
                  P50 Composite vs Traditional Steel
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex-1 px-5 flex flex-col justify-center divide-y divide-gray-100">
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-body text-sm text-gray-500">Steel Extinguishers</p>
                  <p className="font-body text-xs text-gray-400 mt-0.5">Annual engineer service required</p>
                </div>
                <p className="font-heading font-bold text-lg text-brand-black tabular-nums">{totals.totalSteelUnits} units</p>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-body text-sm text-gray-500">P50 Composite</p>
                  <p className="font-body text-xs text-gray-400 mt-0.5">No annual service contract</p>
                </div>
                <p className="font-heading font-bold text-lg text-brand-black tabular-nums">{totals.totalP50Units} units</p>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-body text-sm text-gray-500">Annual Saving</p>
                  <p className="font-body text-xs text-gray-400 mt-0.5">Average saving per year</p>
                </div>
                <p className="font-heading font-bold text-lg text-brand-black tabular-nums">{formatCurrency(totals.annualSaving)}</p>
              </div>
              <div className="flex items-center justify-between py-3 bg-brand-red/5 -mx-5 px-5">
                <p className="font-body text-sm font-semibold text-brand-black">{years}-Year Saving</p>
                <p className="font-heading font-bold text-xl text-brand-red tabular-nums">{formatCurrency(totals.saving)}</p>
              </div>
            </div>
          </div>

          {/* Right: chart + info cards */}
          <div className="lg:col-span-3 flex flex-col gap-4">

            {/* Chart */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex-1 flex flex-col">
              <h3 className="font-heading font-bold text-sm uppercase tracking-wide text-brand-black mb-3">
                Cumulative Cost Over {years} Years
              </h3>
              <div className="flex-1" style={{ minHeight: 200 }}>
                <CumulativeCostChart data={cumulativePoints} breakEvenYear={breakEvenYear} height="100%" />
              </div>
            </div>

            {/* Break-even + CO2 */}
            <div className="grid grid-cols-2 gap-4">
              {breakEvenYear !== null ? (
                <div className={`rounded-xl p-4 flex items-center gap-3 ${breakEvenWithinRange ? 'bg-eco-light border border-eco-green/30' : 'bg-blue-50 border border-blue-200'}`}>
                  <Calendar className={`flex-shrink-0 ${breakEvenWithinRange ? 'text-eco-green' : 'text-blue-400'}`} size={22} />
                  <div>
                    <p className={`font-heading font-bold uppercase text-xs tracking-wide ${breakEvenWithinRange ? 'text-eco-green' : 'text-blue-600'}`}>Break-even</p>
                    <p className="font-heading font-bold text-2xl text-brand-black leading-none mt-0.5">Year {Math.ceil(breakEvenYear)}</p>
                    {breakEvenCalendarYear && (
                      <p className="font-body text-xs text-gray-500 mt-0.5">approximately {breakEvenCalendarYear}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
                  <Info className="text-amber-500 flex-shrink-0" size={22} />
                  <p className="font-body text-xs text-amber-700">P50 does not pay back within 20 years for this mix.</p>
                </div>
              )}

              {totals.co2Saving > 0 && (
                <div className="bg-eco-light border border-eco-green/30 rounded-xl p-4 flex items-center gap-3">
                  <Leaf className="text-eco-green flex-shrink-0" size={22} />
                  <div>
                    <p className="font-heading font-bold uppercase text-xs tracking-wide text-eco-green">CO₂ Reduction</p>
                    <p className="font-heading font-bold text-2xl text-brand-black leading-none mt-0.5">{totals.co2Saving.toFixed(1)} kg</p>
                    <p className="font-body text-xs text-gray-500 mt-0.5">{formatPercent(totals.co2PercentReduction)} less vs steel</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Year slider + CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-3 w-full">
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-body text-sm text-gray-600">
                Period: <span className="font-semibold text-brand-black">{years} years</span>
              </label>
              <span className="font-body text-xs text-gray-400">Drag to adjust</span>
            </div>
            <input
              type="range" min="1" max="20" value={years}
              onChange={e => setYears(Number(e.target.value))}
              className="w-full accent-brand-red cursor-pointer"
            />
            <div className="flex justify-between font-body text-xs text-gray-400 mt-0.5">
              <span>1 year</span><span>20 years</span>
            </div>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <button className="btn-secondary" onClick={() => router.push('/calculator')}>← Recalculate</button>
            <button className="btn-primary" onClick={() => setShowModal(true)}>Get My Report</button>
            <button className="btn-secondary" onClick={() => router.push('/')}>Start Over</button>
          </div>
        </div>
      </main>
    </div>
  )
}
