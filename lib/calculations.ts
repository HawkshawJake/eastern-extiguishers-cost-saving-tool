import {
  ANNUAL_SERVICE_CHARGE,
  DISPOSAL_CHARGE,
  P50_UNIT_DISPOSAL,
  CALLOUT_CHARGE_STEEL,
  CALLOUT_CHARGE_P50,
  P50_INSTALLATION_CHARGE,
  STEEL_CO2_PER_UNIT,
  P50_CO2_PER_UNIT,
  type SteelType,
  type P50Type,
} from '@/data/extinguishers'

// Per-unit steel cost over N years (excludes the site-level £100/yr callout).
// Craig's model: replacement triggers at Year (lifeSpan × n + 1), not Year (lifeSpan × n).
// i.e. a 5-yr unit bought in Year 1 is replaced in Year 6, not Year 5.
export function calcSteelCostPerUnitForYears(type: SteelType, years: number): number {
  if (years === 0) return 0
  const replacements = Math.floor((years - 1) / type.lifeSpan)
  const purchases = 1 + replacements
  const capitalCost = purchases * type.clientCost
  const serviceCost = ANNUAL_SERVICE_CHARGE * years
  const disposalCost = replacements * DISPOSAL_CHARGE
  return capitalCost + serviceCost + disposalCost
}

// Per-unit P50 cost over N years (excludes site-level callout and initial steel disposal).
// First purchase: clientCost + installation. Replacements: 60% price + installation.
export function calcP50CostPerUnitForYears(type: P50Type, years: number): number {
  const purchases = Math.ceil(years / type.lifeSpan)
  if (purchases === 0) return 0
  const replacements = purchases - 1
  return (type.clientCost + P50_INSTALLATION_CHARGE)
    + replacements * (type.clientCost * 0.6 + P50_INSTALLATION_CHARGE)
}

export interface Totals {
  totalSteelCost: number
  totalP50Cost: number
  saving: number
  percentSaving: number
  annualSaving: number
  co2Saving: number
  co2PercentReduction: number
  totalSteelUnits: number
  totalP50Units: number
}

export function calcTotals(
  steelInventory: Record<string, number>,
  p50Inventory: Record<string, number>,
  steelTypes: SteelType[],
  p50Types: P50Type[],
  years = 8,
): Totals {
  let totalSteelCost = 0
  let totalSteelUnits = 0

  for (const type of steelTypes) {
    const qty = steelInventory[type.id] ?? 0
    totalSteelCost += calcSteelCostPerUnitForYears(type, years) * qty
    totalSteelUnits += qty
  }
  // Annual engineer call-out for the steel service contract
  totalSteelCost += CALLOUT_CHARGE_STEEL * years

  let totalP50Cost = 0
  let totalP50Units = 0

  for (const type of p50Types) {
    const qty = p50Inventory[type.id] ?? 0
    totalP50Cost += calcP50CostPerUnitForYears(type, years) * qty
    totalP50Units += qty
  }
  // Disposal of all existing steel units when switching to P50
  totalP50Cost += totalSteelUnits * P50_UNIT_DISPOSAL
  // Call-out for initial P50 installation + one per replacement event across all types
  let p50Callouts = totalP50Units > 0 ? 1 : 0
  for (const type of p50Types) {
    const qty = p50Inventory[type.id] ?? 0
    if (qty === 0) continue
    const replacements = Math.ceil(years / type.lifeSpan) - 1
    p50Callouts += replacements
  }
  totalP50Cost += p50Callouts * CALLOUT_CHARGE_P50

  const saving = totalSteelCost - totalP50Cost
  const percentSaving = totalSteelCost > 0 ? saving / totalSteelCost : 0
  const annualSaving = saving / years

  const steelCO2 = totalSteelUnits * STEEL_CO2_PER_UNIT
  const p50CO2 = totalP50Units * P50_CO2_PER_UNIT
  const co2Saving = steelCO2 - p50CO2
  const co2PercentReduction = steelCO2 > 0 ? co2Saving / steelCO2 : 0

  return {
    totalSteelCost,
    totalP50Cost,
    saving,
    percentSaving,
    annualSaving,
    co2Saving,
    co2PercentReduction,
    totalSteelUnits,
    totalP50Units,
  }
}

export interface CostPoint {
  year: number
  steel: number
  p50: number
}

// Year-by-year cumulative costs for the chart (year 0 = £0 for both).
export function calcCumulativeCosts(
  steelInventory: Record<string, number>,
  p50Inventory: Record<string, number>,
  steelTypes: SteelType[],
  p50Types: P50Type[],
  maxYears: number,
): CostPoint[] {
  const totalSteelUnits = steelTypes.reduce((s, t) => s + (steelInventory[t.id] ?? 0), 0)
  const hasP50 = p50Types.some(t => (p50Inventory[t.id] ?? 0) > 0)

  const points: CostPoint[] = []

  for (let year = 0; year <= maxYears; year++) {
    let steel = 0
    for (const type of steelTypes) {
      const qty = steelInventory[type.id] ?? 0
      if (qty === 0) continue
      steel += calcSteelCostPerUnitForYears(type, year) * qty
    }
    if (year > 0) steel += CALLOUT_CHARGE_STEEL * year

    let p50 = 0
    if (year > 0 && hasP50) {
      for (const type of p50Types) {
        const qty = p50Inventory[type.id] ?? 0
        if (qty === 0) continue
        p50 += calcP50CostPerUnitForYears(type, year) * qty
      }
      p50 += totalSteelUnits * P50_UNIT_DISPOSAL
      // Initial installation callout + one per replacement event up to this year
      let callouts = 1
      for (const type of p50Types) {
        const qty = p50Inventory[type.id] ?? 0
        if (qty === 0) continue
        callouts += Math.ceil(year / type.lifeSpan) - 1
      }
      p50 += callouts * CALLOUT_CHARGE_P50
    }

    points.push({ year, steel, p50 })
  }

  return points
}

// Returns the fractional year where steel cumulative first exceeds P50 cumulative
export function findBreakEvenYear(points: CostPoint[]): number | null {
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    if (curr.steel >= curr.p50) {
      const steelDelta = curr.steel - prev.steel
      const p50Delta = curr.p50 - prev.p50
      const divisor = steelDelta - p50Delta
      if (divisor === 0) return curr.year
      const frac = (prev.p50 - prev.steel) / divisor
      return prev.year + frac
    }
  }
  return null
}

export interface CategoryBreakdown {
  category: string
  steel: number
  p50: number
}

const CATEGORY_ORDER = ['CO2', 'Water', 'Water Mist', 'Foam', 'Powder', 'Wet Chemical']

export function calcCategoryBreakdown(
  steelInventory: Record<string, number>,
  p50Inventory: Record<string, number>,
  steelTypes: SteelType[],
  p50Types: P50Type[],
  years: number,
): CategoryBreakdown[] {
  return CATEGORY_ORDER.flatMap(category => {
    let steel = 0
    for (const t of steelTypes.filter(t => t.category === category)) {
      steel += calcSteelCostPerUnitForYears(t, years) * (steelInventory[t.id] ?? 0)
    }
    let p50 = 0
    for (const t of p50Types.filter(t => t.category === category)) {
      p50 += calcP50CostPerUnitForYears(t, years) * (p50Inventory[t.id] ?? 0)
    }
    return steel > 0 || p50 > 0 ? [{ category, steel, p50 }] : []
  })
}

export function formatCurrency(amount: number): string {
  return `£${Math.round(amount).toLocaleString('en-GB')}`
}

export function formatPercent(ratio: number): string {
  return `${(ratio * 100).toFixed(1)}%`
}

export function formatYAxis(value: number): string {
  if (value >= 1_000_000) return `£${(value / 1_000_000).toFixed(1)}m`
  if (value >= 1_000) return `£${(value / 1_000).toFixed(0)}k`
  return `£${value}`
}
