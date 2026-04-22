# Eastern Extinguishers — Calculation Logic
## Extracted from HSE2025 Excel Model

---

## Overview

The calculator compares two scenarios over 8 years:
1. **Steel (Current):** Customer keeps their existing steel extinguishers, paying annual service charges + periodic exchange/replacement
2. **P50 (Proposed):** Customer switches to Eastern Extinguishers' composite P50 units — no annual service call needed, just a one-off composite cost

The output is the **cash saving** and **% saving** over 8 years, plus a **CO2 reduction** figure.

---

## Steel Extinguisher — Per-Unit 8-Year Cost

Each steel extinguisher type has:
- A **unit cost** (what the customer originally paid / benchmark price)
- A **service charge** of **£12.86/year** (annual engineer visit)
- A **disposal charge** of **£8.49** per unit at end of life
- A **life span** (years before replacement)
- An **exchange charge** (cost to exchange/refill at end of life)

### Steel Cost Formula (per unit, over 8 years)

```
annualServiceCost = 12.86 per unit per year

# How many full life cycles fit in 8 years?
cycles = floor(8 / lifeSpan)
remainder = 8 % lifeSpan

# Exchange cost: paid at end of each full life cycle
exchangeCost = cycles * exchangeCharge

# If there's a remainder, the unit is mid-cycle — no extra exchange cost

# Disposal: paid once per cycle at end of life
disposalCost = cycles * disposalCharge

# Annual service over 8 years
totalServiceCost = 12.86 * 8

# Total per unit over 8 years
steelCostPerUnit = totalServiceCost + exchangeCost + disposalCost

# Total for all units of this type
steelCostForType = steelCostPerUnit * quantity
```

### Steel Extinguisher Data Table

All charges are per unit. Annual service = £12.86 for all types. Disposal = £8.49 for all types.

| Type | Life Span (yrs) | Exchange Charge (£) |
|------|----------------|---------------------|
| 2K CO2 | 10 | 46.60 |
| 2K CO2 Non-Magnetic | 10 | 92.35 |
| 5K CO2 | 10 | 68.54 |
| Water 3L | 5 | 35.43 |
| Water 6L | 5 | 32.74 |
| Water 9L | 5 | 35.26 |
| Water Mist 3L | 5 | 41.59 |
| Water Mist 6L | 5 | 48.99 |
| Water Mist 9L | 5 | 61.19 |
| Foam 1L | 5 | 19.39 |
| Foam 2L | 5 | 27.52 |
| Foam 3L | 5 | 36.29 |
| Foam 6L | 5 | 44.65 |
| Foam 9L | 5 | 52.51 |
| Powder 2K | 5 | 23.27 |
| Powder 4K | 5 | 34.44 |
| Powder 6K | 5 | 40.40 |
| Powder 9K | 5 | 39.93 |
| Powder 12K | 5 | 46.43 |
| Wet Chem 3L | 5 | 51.73 |
| Wet Chem 6L | 5 | 79.86 |
| Wet Chem 9L | 5 | 111.21 |

---

## P50 Extinguisher — Per-Unit 8-Year Cost

P50 composites are supplied as a **one-off composite cost** — no annual service call. They are replaced at end of their 8-year cycle (which aligns with the comparison window).

### P50 Cost Formula

```
p50CostPerUnit = compositeClientCost   # One-off, no annual service

p50CostForType = p50CostPerUnit * quantity
```

The P50 units do NOT incur annual service charges (this is the key selling point).

### P50 Product Data Table

These are the P50 composite products Eastern sells:

| P50 Type | Client Cost (£) | Typical Life (yrs) |
|----------|----------------|-------------------|
| 2L Foam Composite | 65.38 | 10 |
| 6L Foam Composite | — (use 6L ECO-Foam) | 10 |
| 6L ECO-Foam Composite | 133.64 | 8 |
| 9L Foam Composite | 152.73 | 10 |
| 2K Powder Composite | 65.38 | 10 |
| 6K Powder Composite | 119.33 | 10 |
| 9K Powder Composite | 152.73 | 10 |
| 6L Wet Chemical F-Class Composite | 159.95 | 10 |
| 2L WaterMist Composite | 79.13 | 10 |
| 6L WaterMist Composite | 123.71 | 10 |
| 6L Foam Composite Black Edition | 190.91 | 10 |

> Note: The 6L ECO-Foam has an 8-year life cycle (aligns with the comparison window so no mid-cycle replacement). All others are 10-year life so within the 8-year window only one purchase is needed.

---

## Steel → P50 Mapping

When a user enters Steel quantities, suggest these P50 equivalents as default. User can override.

| Steel Type | Recommended P50 Equivalent |
|-----------|---------------------------|
| 2K CO2 | 2K CO2 (no P50 equivalent — retained as-is, use 2K Powder Composite as proxy if needed) |
| Foam 2L | 2L Foam Composite |
| Foam 6L | 6L ECO-Foam Composite |
| Foam 9L | 9L Foam Composite |
| Powder 2K | 2K Powder Composite |
| Powder 6K | 6K Powder Composite |
| Powder 9K | 9K Powder Composite |
| Wet Chem 6L | 6L Wet Chemical F-Class Composite |
| Water Mist 2L | 2L WaterMist Composite |
| Water Mist 6L | 6L WaterMist Composite |

> For simplicity in the web app: when a user enters Steel quantities, default P50 quantities to match 1:1. Let them adjust manually. Don't try to auto-derive — the spreadsheet itself relied on manual input for P50 quantities.

---

## Grand Total Calculation

```typescript
// Sum across all Steel types
totalSteelCost8yr = sum of (steelCostForType) for all types

// Sum across all P50 types  
totalP50Cost8yr = sum of (p50CostForType) for all types

// Saving
totalSaving8yr = totalSteelCost8yr - totalP50Cost8yr

// Percentage saving
percentSaving = totalSaving8yr / totalSteelCost8yr   // display as %

// If totalSteelCost8yr is 0, percentSaving = 0 (avoid divide by zero)
```

---

## CO2 Reduction

From the KG CO2 Reduction sheet:

```
steelCO2PerUnit = 4.39 kgCO2e
p50CO2PerUnit   = 2.15 kgCO2e

totalSteelCO2 = totalSteelUnits * 4.39
totalP50CO2   = totalP50Units * 2.15

co2Saving     = totalSteelCO2 - totalP50CO2
co2PercentReduction = co2Saving / totalSteelCO2   // display as %
```

Where `totalSteelUnits` = sum of all Steel quantities, and `totalP50Units` = sum of all P50 quantities.

---

## Example (From the Spreadsheet)

Input:
- 400 × 2K CO2 Steel
- 400 × 6L Foam Steel  
- 150 × 6K Powder Steel
- 400 × 6L ECO-Foam P50
- 150 × 6K Powder P50

Results:
- **Total Steel 8yr cost:** £214,009
- **Total P50 8yr cost:** £83,180
- **8yr saving:** £130,829
- **% saving:** 61.1%
- **CO2 reduction:** 71.6%

---

## TypeScript Implementation Sketch

```typescript
// lib/calculations.ts

export interface ExtinguisherType {
  id: string
  label: string
  lifeSpan: number        // years
  exchangeCharge: number  // £ per unit
  isP50: boolean
  p50ClientCost?: number  // only for P50 types
}

const ANNUAL_SERVICE = 12.86
const DISPOSAL = 8.49
const COMPARISON_YEARS = 8
const STEEL_CO2_PER_UNIT = 4.39
const P50_CO2_PER_UNIT = 2.15

export function calcSteelCostPerUnit(type: ExtinguisherType): number {
  const cycles = Math.floor(COMPARISON_YEARS / type.lifeSpan)
  const exchangeCost = cycles * type.exchangeCharge
  const disposalCost = cycles * DISPOSAL
  const serviceCost = ANNUAL_SERVICE * COMPARISON_YEARS
  return serviceCost + exchangeCost + disposalCost
}

export function calcP50CostPerUnit(type: ExtinguisherType): number {
  // One-off composite cost, no service. Within 8 years, 8yr life = 1 purchase, 10yr life = 1 purchase
  return type.p50ClientCost ?? 0
}

export function calcTotals(
  steelInventory: Record<string, number>,
  p50Inventory: Record<string, number>,
  steelTypes: ExtinguisherType[],
  p50Types: ExtinguisherType[]
) {
  let totalSteelCost = 0
  let totalSteelUnits = 0

  for (const type of steelTypes) {
    const qty = steelInventory[type.id] ?? 0
    totalSteelCost += calcSteelCostPerUnit(type) * qty
    totalSteelUnits += qty
  }

  let totalP50Cost = 0
  let totalP50Units = 0

  for (const type of p50Types) {
    const qty = p50Inventory[type.id] ?? 0
    totalP50Cost += calcP50CostPerUnit(type) * qty
    totalP50Units += qty
  }

  const saving = totalSteelCost - totalP50Cost
  const percentSaving = totalSteelCost > 0 ? saving / totalSteelCost : 0

  const steelCO2 = totalSteelUnits * STEEL_CO2_PER_UNIT
  const p50CO2 = totalP50Units * P50_CO2_PER_UNIT
  const co2Saving = steelCO2 - p50CO2
  const co2PercentReduction = steelCO2 > 0 ? co2Saving / steelCO2 : 0

  return {
    totalSteelCost,
    totalP50Cost,
    saving,
    percentSaving,
    co2Saving,
    co2PercentReduction,
    totalSteelUnits,
    totalP50Units,
  }
}
```