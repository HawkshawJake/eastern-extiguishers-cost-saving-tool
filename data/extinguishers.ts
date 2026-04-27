export const ANNUAL_SERVICE_CHARGE = 12.86
export const DISPOSAL_CHARGE = 8.49       // steel end-of-life disposal per unit
export const P50_UNIT_DISPOSAL = 6.00     // P50/steel disposal charge when switching to P50
export const CALLOUT_CHARGE_STEEL = 100   // annual engineer call-out on steel contract
export const CALLOUT_CHARGE_P50 = 75      // call-out when P50 units are installed or replaced
export const P50_INSTALLATION_CHARGE = 11 // per-unit installation charge for P50
export const COMPARISON_YEARS = 8
export const STEEL_CO2_PER_UNIT = 4.39
export const P50_CO2_PER_UNIT = 2.15

export interface SteelType {
  id: string
  label: string
  lifeSpan: number
  clientCost: number  // client-facing unit cost (not EE's exchange/trade price)
  category: string
}

export interface P50Type {
  id: string
  label: string
  clientCost: number
  lifeSpan: number
  category: string
}

export const STEEL_TYPES: SteelType[] = [
  { id: 'co2_2k',        label: '2K CO2',              lifeSpan: 10, clientCost: 77.67,   category: 'CO2' },
  { id: 'co2_2k_nonmag', label: '2K CO2 Non-Magnetic', lifeSpan: 10, clientCost: 153.91,  category: 'CO2' },
  { id: 'co2_5k',        label: '5K CO2',              lifeSpan: 10, clientCost: 114.23,  category: 'CO2' },

  { id: 'water_3l',      label: 'Water 3L',            lifeSpan: 5,  clientCost: 59.05,   category: 'Water' },
  { id: 'water_6l',      label: 'Water 6L',            lifeSpan: 5,  clientCost: 54.56,   category: 'Water' },
  { id: 'water_9l',      label: 'Water 9L',            lifeSpan: 5,  clientCost: 58.76,   category: 'Water' },

  { id: 'watermist_3l',  label: 'Water Mist 3L',       lifeSpan: 5,  clientCost: 69.32,   category: 'Water Mist' },
  { id: 'watermist_6l',  label: 'Water Mist 6L',       lifeSpan: 5,  clientCost: 81.66,   category: 'Water Mist' },
  { id: 'watermist_9l',  label: 'Water Mist 9L',       lifeSpan: 5,  clientCost: 101.99,  category: 'Water Mist' },

  { id: 'foam_1l',       label: 'Foam 1L',             lifeSpan: 5,  clientCost: 32.32,   category: 'Foam' },
  { id: 'foam_2l',       label: 'Foam 2L',             lifeSpan: 5,  clientCost: 45.87,   category: 'Foam' },
  { id: 'foam_3l',       label: 'Foam 3L',             lifeSpan: 5,  clientCost: 60.49,   category: 'Foam' },
  { id: 'foam_6l',       label: 'Foam 6L',             lifeSpan: 5,  clientCost: 74.42,   category: 'Foam' },
  { id: 'foam_9l',       label: 'Foam 9L',             lifeSpan: 5,  clientCost: 87.51,   category: 'Foam' },

  { id: 'powder_2k',     label: 'Powder 2K',           lifeSpan: 5,  clientCost: 38.78,   category: 'Powder' },
  { id: 'powder_4k',     label: 'Powder 4K',           lifeSpan: 5,  clientCost: 57.40,   category: 'Powder' },
  { id: 'powder_6k',     label: 'Powder 6K',           lifeSpan: 5,  clientCost: 67.33,   category: 'Powder' },
  { id: 'powder_9k',     label: 'Powder 9K',           lifeSpan: 5,  clientCost: 66.55,   category: 'Powder' },
  { id: 'powder_12k',    label: 'Powder 12K',          lifeSpan: 5,  clientCost: 77.38,   category: 'Powder' },

  { id: 'wetchem_3l',    label: 'Wet Chemical 3L',     lifeSpan: 5,  clientCost: 86.22,   category: 'Wet Chemical' },
  { id: 'wetchem_6l',    label: 'Wet Chemical 6L',     lifeSpan: 5,  clientCost: 133.11,  category: 'Wet Chemical' },
  { id: 'wetchem_9l',    label: 'Wet Chemical 9L',     lifeSpan: 5,  clientCost: 185.35,  category: 'Wet Chemical' },
]

export const P50_TYPES: P50Type[] = [
  { id: 'p50_foam_2l',      label: '2L Foam Composite',         clientCost: 65.38,  lifeSpan: 10, category: 'Foam' },
  { id: 'p50_foam_6l_eco',  label: '6L ECO-Foam Composite',     clientCost: 133.64, lifeSpan: 10, category: 'Foam' },
  { id: 'p50_foam_9l',      label: '9L Foam Composite',         clientCost: 152.73, lifeSpan: 10, category: 'Foam' },
  { id: 'p50_foam_6l_blk',  label: '6L Foam Composite Black',   clientCost: 190.91, lifeSpan: 10, category: 'Foam' },

  { id: 'p50_powder_2k',    label: '2K Powder Composite',       clientCost: 65.38,  lifeSpan: 10, category: 'Powder' },
  { id: 'p50_powder_6k',    label: '6K Powder Composite',       clientCost: 119.33, lifeSpan: 10, category: 'Powder' },
  { id: 'p50_powder_9k',    label: '9K Powder Composite',       clientCost: 152.73, lifeSpan: 10, category: 'Powder' },

  { id: 'p50_wetchem_6l',   label: '6L Wet Chemical Composite', clientCost: 159.95, lifeSpan: 10, category: 'Wet Chemical' },

  { id: 'p50_watermist_2l', label: '2L Water Mist Composite',   clientCost: 79.13,  lifeSpan: 10, category: 'Water Mist' },
  { id: 'p50_watermist_6l', label: '6L Water Mist Composite',   clientCost: 123.71, lifeSpan: 10, category: 'Water Mist' },
]

export const STEEL_TO_P50_MAP: Record<string, string | null> = {
  co2_2k:        'p50_foam_6l_eco',
  co2_2k_nonmag: 'p50_foam_6l_eco',
  co2_5k:        'p50_foam_6l_eco',
  water_3l:      'p50_foam_6l_eco',
  water_6l:      'p50_foam_6l_eco',
  water_9l:      'p50_foam_6l_eco',
  watermist_3l:  null,
  watermist_6l:  'p50_watermist_6l',
  watermist_9l:  null,
  foam_1l:       null,
  foam_2l:       'p50_watermist_2l',
  foam_3l:       'p50_foam_6l_eco',
  foam_6l:       'p50_foam_6l_eco',
  foam_9l:       'p50_foam_6l_eco',
  powder_2k:     'p50_powder_2k',
  powder_4k:     'p50_powder_6k',
  powder_6k:     'p50_powder_6k',
  powder_9k:     'p50_powder_9k',
  powder_12k:    null,
  wetchem_3l:    null,
  wetchem_6l:    'p50_wetchem_6l',
  wetchem_9l:    null,
}

export const INDUSTRIES = [
  'Care',
  'Health',
  'Hospitality',
  'Iconic Institution',
  'Local Government',
  'Retail',
  'Schools',
  'Transport',
  'Universities',
  'Other',
]

export const STEEL_CATEGORIES = ['CO2', 'Water', 'Water Mist', 'Foam', 'Powder', 'Wet Chemical']
export const P50_CATEGORIES = ['Foam', 'Powder', 'Wet Chemical', 'Water Mist']

export interface IndustryPreset {
  steel: Record<string, number>
  p50: Record<string, number>
}

export const INDUSTRY_PRESETS: Record<string, IndustryPreset> = {
  'Care': {
    steel: { co2_2k: 454, foam_6l: 391, powder_6k: 51, wetchem_6l: 11 },
    p50:   { p50_foam_6l_eco: 454, p50_powder_6k: 51, p50_wetchem_6l: 11 },
  },
  'Health': {
    steel: { co2_2k: 716, water_9l: 521, foam_6l: 69, powder_6k: 31, wetchem_6l: 3 },
    p50:   { p50_foam_6l_eco: 820, p50_wetchem_6l: 3 },
  },
  'Hospitality': {
    steel: { co2_2k: 1725, co2_5k: 23, water_6l: 126, water_9l: 6, foam_3l: 636, foam_6l: 983, foam_9l: 153, powder_4k: 78, powder_6k: 25, wetchem_6l: 363 },
    p50:   { p50_foam_6l_eco: 2207, p50_powder_6k: 103, p50_wetchem_6l: 363 },
  },
  'Iconic Institution': {
    steel: { co2_2k: 526, co2_5k: 12, water_6l: 538, water_9l: 14, foam_6l: 106, foam_9l: 5, powder_6k: 9 },
    p50:   { p50_foam_6l_eco: 620 },
  },
  'Local Government': {
    steel: { co2_2k: 80, water_6l: 72, foam_6l: 81, powder_6k: 12 },
    p50:   { p50_foam_6l_eco: 162, p50_powder_6k: 12 },
  },
  'Retail': {
    steel: { co2_2k: 4141, foam_6l: 8161, foam_9l: 215 },
    p50:   { p50_foam_6l_eco: 6341 },
  },
  'Schools': {
    steel: { co2_2k: 347, water_3l: 185, water_6l: 115, water_9l: 1, foam_2l: 1, foam_6l: 66, foam_9l: 1, powder_2k: 21, powder_4k: 23, powder_6k: 11, wetchem_6l: 7 },
    p50:   { p50_watermist_2l: 1, p50_foam_6l_eco: 352, p50_powder_2k: 21, p50_powder_6k: 34, p50_wetchem_6l: 7 },
  },
  'Transport': {
    steel: { co2_2k: 293, co2_5k: 64, water_6l: 14, water_9l: 13, foam_2l: 8, foam_6l: 262, foam_9l: 16, powder_2k: 36, powder_6k: 163, powder_9k: 80 },
    p50:   { p50_watermist_2l: 8, p50_foam_6l_eco: 305, p50_powder_2k: 36, p50_powder_6k: 163, p50_powder_9k: 80 },
  },
  'Universities': {
    steel: { co2_2k: 66, co2_5k: 5, water_6l: 86, water_9l: 5, foam_6l: 23, powder_2k: 346, powder_6k: 11, powder_9k: 1, wetchem_6l: 1 },
    p50:   { p50_foam_6l_eco: 128, p50_powder_2k: 346, p50_powder_6k: 11, p50_powder_9k: 1, p50_wetchem_6l: 1 },
  },
  'Other': {
    steel: {},
    p50:   {},
  },
}
