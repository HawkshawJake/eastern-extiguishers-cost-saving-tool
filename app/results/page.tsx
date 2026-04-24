'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { TrendingDown, Leaf, Calculator, Calendar, Info } from 'lucide-react'
import Header from '@/components/Header'
import { useInventory } from '@/context/InventoryContext'
import { STEEL_TYPES, P50_TYPES } from '@/data/extinguishers'
import {
  calcTotals,
  calcCumulativeCosts,
  calcCategoryBreakdown,
  findBreakEvenYear,
  formatCurrency,
  formatPercent,
} from '@/lib/calculations'
import { addEntry } from '@/lib/eventStore'

// SSR-safe dynamic imports for recharts components
const CumulativeCostChart = dynamic(
  () => import('@/components/charts/CumulativeCostChart'),
  { ssr: false, loading: () => <div className="h-[300px] flex items-center justify-center text-gray-400 text-sm">Loading chart…</div> },
)
const CategoryChart = dynamic(
  () => import('@/components/charts/CategoryChart'),
  { ssr: false, loading: () => <div className="h-[240px] flex items-center justify-center text-gray-400 text-sm">Loading chart…</div> },
)

function MetricRow({
  label,
  value,
  sub,
  highlight,
}: {
  label: string
  value: string
  sub?: string
  highlight?: boolean
}) {
  return (
    <div
      className={`flex items-center justify-between py-4 border-b border-gray-100 last:border-0 ${
        highlight ? 'bg-brand-red/5 -mx-6 px-6' : ''
      }`}
    >
      <div>
        <p className={`font-body text-sm ${highlight ? 'font-semibold text-brand-black' : 'text-gray-500'}`}>
          {label}
        </p>
        {sub && <p className="font-body text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      <p className={`font-heading font-bold text-xl tabular-nums ${highlight ? 'text-brand-red' : 'text-brand-black'}`}>
        {value}
      </p>
    </div>
  )
}

export default function ResultsPage() {
  const router = useRouter()
  const { company, industry, steelInventory, p50Inventory } = useInventory()
  const [years, setYears] = useState(8)
  const savedRef = useRef(false)

  // Always compute at standard 8 years for the leaderboard entry
  const defaultTotals = useMemo(
    () => calcTotals(steelInventory, p50Inventory, STEEL_TYPES, P50_TYPES, 8),
    [steelInventory, p50Inventory],
  )

  // Save this visitor's results once per navigation to this page
  useEffect(() => {
    if (savedRef.current) return
    if (defaultTotals.saving <= 0) return
    savedRef.current = true
    // Deduplicate across refreshes using a session key
    const key = `ee_saved_${Math.round(defaultTotals.totalSteelCost)}_${Math.round(defaultTotals.totalP50Cost)}`
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, '1')
    addEntry({
      company: company || 'Anonymous',
      industry: industry || 'Other',
      saving: defaultTotals.saving,
      steel_inventory: steelInventory,
      p50_inventory: p50Inventory,
    }).catch(() => { /* non-critical, ignore network errors */ })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const totals = useMemo(
    () => calcTotals(steelInventory, p50Inventory, STEEL_TYPES, P50_TYPES, years),
    [steelInventory, p50Inventory, years],
  )

  const cumulativePoints = useMemo(
    () => calcCumulativeCosts(steelInventory, p50Inventory, STEEL_TYPES, P50_TYPES, years),
    [steelInventory, p50Inventory, years],
  )

  const breakEvenYear = useMemo(
    () => findBreakEvenYear(calcCumulativeCosts(steelInventory, p50Inventory, STEEL_TYPES, P50_TYPES, 30)),
    [steelInventory, p50Inventory],
  )

  const categoryData = useMemo(
    () => calcCategoryBreakdown(steelInventory, p50Inventory, STEEL_TYPES, P50_TYPES, years),
    [steelInventory, p50Inventory, years],
  )

  const hasData = totals.totalSteelUnits > 0 || totals.totalP50Units > 0

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

  const contextLabel = [company, industry].filter(Boolean).join(' · ')
  const breakEvenCalendarYear =
    breakEvenYear !== null ? new Date().getFullYear() + Math.ceil(breakEvenYear) : null
  const breakEvenWithinRange = breakEvenYear !== null && breakEvenYear <= years

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header step={3} />

      <main className="flex-1 max-w-2xl mx-auto w-full px-5 py-8 md:py-12">
        {contextLabel && (
          <p className="font-body text-sm text-gray-400 uppercase tracking-widest mb-4 text-center">
            {contextLabel}
          </p>
        )}

        {/* Hero saving card */}
        <div className="bg-brand-dark rounded-md p-8 md:p-12 text-center mb-5">
          <div className="flex justify-center mb-3">
            <TrendingDown className="text-brand-red-light" size={32} strokeWidth={2} />
          </div>
          <p className="font-body text-white/50 uppercase tracking-widest text-xs mb-3">
            You Could Save
          </p>
          <p className="font-heading font-black text-5xl md:text-7xl text-brand-red-light leading-none tabular-nums">
            {formatCurrency(totals.saving)}
          </p>
          <p className="font-body text-white/70 mt-4 text-lg">over {years} years</p>
          {totals.percentSaving > 0 && (
            <p className="font-body text-white/40 text-sm mt-1">
              {formatPercent(totals.percentSaving)} reduction on your current costs
            </p>
          )}
        </div>

        {/* Year slider */}
        <div className="bg-white rounded-md border border-gray-200 shadow-sm p-5 mb-5">
          <div className="flex items-center justify-between mb-3">
            <label className="font-body text-sm text-gray-600">
              Comparison period:{' '}
              <span className="font-semibold text-brand-black">{years} years</span>
            </label>
            <span className="font-body text-xs text-gray-400">Drag to adjust</span>
          </div>
          <input
            type="range"
            min="1"
            max="20"
            value={years}
            onChange={e => setYears(Number(e.target.value))}
            className="w-full accent-brand-red cursor-pointer"
          />
          <div className="flex justify-between font-body text-xs text-gray-400 mt-1">
            <span>1 year</span>
            <span>20 years</span>
          </div>
        </div>

        {/* Break-even callout */}
        {breakEvenYear !== null ? (
          <div
            className={`rounded-md p-4 mb-5 flex items-start gap-3 ${
              breakEvenWithinRange
                ? 'bg-eco-light border border-eco-green/30'
                : 'bg-blue-50 border border-blue-200'
            }`}
          >
            <Calendar
              className={breakEvenWithinRange ? 'text-eco-green' : 'text-blue-400'}
              size={20}
            />
            <div>
              <p
                className={`font-heading font-bold uppercase text-sm tracking-wide ${
                  breakEvenWithinRange ? 'text-eco-green' : 'text-blue-600'
                }`}
              >
                Break-even point
              </p>
              <p className="font-body font-semibold text-brand-black">
                Year {Math.ceil(breakEvenYear)}{' '}
                {breakEvenCalendarYear && (
                  <span className="font-normal text-gray-500">
                    · approximately {breakEvenCalendarYear}
                  </span>
                )}
              </p>
              <p className="font-body text-xs text-gray-500 mt-0.5">
                P50 units pay for themselves after {Math.ceil(breakEvenYear)}{' '}
                {Math.ceil(breakEvenYear) === 1 ? 'year' : 'years'}
                {!breakEvenWithinRange && ' — extend the period to see this on the chart'}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-5 flex items-start gap-3">
            <Info className="text-amber-500 flex-shrink-0" size={20} />
            <p className="font-body text-sm text-amber-700">
              P50 does not pay back within 20 years for this inventory mix. Check your P50
              quantities are set correctly.
            </p>
          </div>
        )}

        {/* Cumulative cost chart */}
        <div className="bg-white rounded-md border border-gray-200 shadow-sm p-5 mb-5">
          <h3 className="font-heading font-bold text-base uppercase tracking-wide text-brand-black mb-4">
            Cumulative Cost Over {years} Years
          </h3>
          <CumulativeCostChart data={cumulativePoints} breakEvenYear={breakEvenYear} />
        </div>

        {/* Category breakdown chart */}
        {categoryData.length > 0 && (
          <div className="bg-white rounded-md border border-gray-200 shadow-sm p-5 mb-5">
            <h3 className="font-heading font-bold text-base uppercase tracking-wide text-brand-black mb-4">
              Cost Breakdown by Category
            </h3>
            <CategoryChart data={categoryData} />
          </div>
        )}

        {/* Stats table */}
        <div className="bg-white rounded-md border border-gray-200 shadow-sm px-6 py-2 mb-5">
          <MetricRow
            label="Current Steel Extinguishers"
            value={formatCurrency(totals.totalSteelCost)}
            sub={`${totals.totalSteelUnits} units · service, exchange & disposal over ${years} yrs`}
          />
          <MetricRow
            label="P50 Composite Extinguishers"
            value={formatCurrency(totals.totalP50Cost)}
            sub={`${totals.totalP50Units} units · one-off composite cost, no annual service`}
          />
          <MetricRow
            label={`Your ${years}-Year Saving`}
            value={formatCurrency(totals.saving)}
            sub={`${formatPercent(totals.percentSaving)} saving · ${formatCurrency(totals.annualSaving)} / year`}
            highlight
          />
        </div>

        {/* CO2 badge */}
        {totals.co2Saving > 0 && (
          <div className="bg-eco-light border border-eco-green/30 rounded-md p-5 flex items-start gap-4 mb-8">
            <Leaf className="text-eco-green flex-shrink-0 mt-0.5" size={24} strokeWidth={2} />
            <div>
              <p className="font-heading font-bold uppercase text-eco-green text-sm tracking-wide">
                CO2 Reduction
              </p>
              <p className="font-body text-2xl font-semibold text-brand-black mt-1">
                {totals.co2Saving.toFixed(1)} kg CO2e saved
              </p>
              <p className="font-body text-sm text-gray-500 mt-0.5">
                {formatPercent(totals.co2PercentReduction)} reduction vs steel extinguishers
              </p>
            </div>
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="btn-secondary flex-1" onClick={() => router.push('/calculator')}>
            ← Recalculate
          </button>
          <button className="btn-primary flex-1" onClick={() => router.push('/')}>
            Start Over
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 font-body mt-6">
          Figures are estimates based on typical service, exchange, and disposal charges. Speak to
          an Eastern Extinguishers advisor for a tailored quote.
        </p>
      </main>
    </div>
  )
}
