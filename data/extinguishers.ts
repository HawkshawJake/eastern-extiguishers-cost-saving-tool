export const ANNUAL_SERVICE_CHARGE = 12.86
export const DISPOSAL_CHARGE = 8.49
export const COMPARISON_YEARS = 8
export const STEEL_CO2_PER_UNIT = 4.39
export const P50_CO2_PER_UNIT = 2.15

export interface SteelType {
  id: string
  label: string
  lifeSpan: number
  exchangeCharge: number
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
  { id: 'co2_2k',        label: '2K CO2',             lifeSpan: 10, exchangeCharge: 46.60,  category: 'CO2' },
  { id: 'co2_2k_nonmag', label: '2K CO2 Non-Magnetic', lifeSpan: 10, exchangeCharge: 92.35,  category: 'CO2' },
  { id: 'co2_5k',        label: '5K CO2',             lifeSpan: 10, exchangeCharge: 68.54,  category: 'CO2' },

  { id: 'water_3l',      label: 'Water 3L',           lifeSpan: 5,  exchangeCharge: 35.43,  category: 'Water' },
  { id: 'water_6l',      label: 'Water 6L',           lifeSpan: 5,  exchangeCharge: 32.74,  category: 'Water' },
  { id: 'water_9l',      label: 'Water 9L',           lifeSpan: 5,  exchangeCharge: 35.26,  category: 'Water' },

  { id: 'watermist_3l',  label: 'Water Mist 3L',      lifeSpan: 5,  exchangeCharge: 41.59,  category: 'Water Mist' },
  { id: 'watermist_6l',  label: 'Water Mist 6L',      lifeSpan: 5,  exchangeCharge: 48.99,  category: 'Water Mist' },
  { id: 'watermist_9l',  label: 'Water Mist 9L',      lifeSpan: 5,  exchangeCharge: 61.19,  category: 'Water Mist' },

  { id: 'foam_1l',       label: 'Foam 1L',            lifeSpan: 5,  exchangeCharge: 19.39,  category: 'Foam' },
  { id: 'foam_2l',       label: 'Foam 2L',            lifeSpan: 5,  exchangeCharge: 27.52,  category: 'Foam' },
  { id: 'foam_3l',       label: 'Foam 3L',            lifeSpan: 5,  exchangeCharge: 36.29,  category: 'Foam' },
  { id: 'foam_6l',       label: 'Foam 6L',            lifeSpan: 5,  exchangeCharge: 44.65,  category: 'Foam' },
  { id: 'foam_9l',       label: 'Foam 9L',            lifeSpan: 5,  exchangeCharge: 52.51,  category: 'Foam' },

  { id: 'powder_2k',     label: 'Powder 2K',          lifeSpan: 5,  exchangeCharge: 23.27,  category: 'Powder' },
  { id: 'powder_4k',     label: 'Powder 4K',          lifeSpan: 5,  exchangeCharge: 34.44,  category: 'Powder' },
  { id: 'powder_6k',     label: 'Powder 6K',          lifeSpan: 5,  exchangeCharge: 40.40,  category: 'Powder' },
  { id: 'powder_9k',     label: 'Powder 9K',          lifeSpan: 5,  exchangeCharge: 39.93,  category: 'Powder' },
  { id: 'powder_12k',    label: 'Powder 12K',         lifeSpan: 5,  exchangeCharge: 46.43,  category: 'Powder' },

  { id: 'wetchem_3l',    label: 'Wet Chemical 3L',    lifeSpan: 5,  exchangeCharge: 51.73,  category: 'Wet Chemical' },
  { id: 'wetchem_6l',    label: 'Wet Chemical 6L',    lifeSpan: 5,  exchangeCharge: 79.86,  category: 'Wet Chemical' },
  { id: 'wetchem_9l',    label: 'Wet Chemical 9L',    lifeSpan: 5,  exchangeCharge: 111.21, category: 'Wet Chemical' },
]

export const P50_TYPES: P50Type[] = [
  { id: 'p50_foam_2l',      label: '2L Foam Composite',           clientCost: 65.38,  lifeSpan: 10, category: 'Foam' },
  { id: 'p50_foam_6l_eco',  label: '6L ECO-Foam Composite',       clientCost: 133.64, lifeSpan: 8,  category: 'Foam' },
  { id: 'p50_foam_9l',      label: '9L Foam Composite',           clientCost: 152.73, lifeSpan: 10, category: 'Foam' },
  { id: 'p50_foam_6l_blk',  label: '6L Foam Composite Black',     clientCost: 190.91, lifeSpan: 10, category: 'Foam' },

  { id: 'p50_powder_2k',    label: '2K Powder Composite',         clientCost: 65.38,  lifeSpan: 10, category: 'Powder' },
  { id: 'p50_powder_6k',    label: '6K Powder Composite',         clientCost: 119.33, lifeSpan: 10, category: 'Powder' },
  { id: 'p50_powder_9k',    label: '9K Powder Composite',         clientCost: 152.73, lifeSpan: 10, category: 'Powder' },

  { id: 'p50_wetchem_6l',   label: '6L Wet Chemical Composite',   clientCost: 159.95, lifeSpan: 10, category: 'Wet Chemical' },

  { id: 'p50_watermist_2l', label: '2L Water Mist Composite',     clientCost: 79.13,  lifeSpan: 10, category: 'Water Mist' },
  { id: 'p50_watermist_6l', label: '6L Water Mist Composite',     clientCost: 123.71, lifeSpan: 10, category: 'Water Mist' },
]

export const STEEL_TO_P50_MAP: Record<string, string | null> = {
  co2_2k:        null,
  co2_2k_nonmag: null,
  co2_5k:        null,
  water_3l:      null,
  water_6l:      null,
  water_9l:      null,
  watermist_3l:  null,
  watermist_6l:  'p50_watermist_6l',
  watermist_9l:  null,
  foam_1l:       null,
  foam_2l:       'p50_foam_2l',
  foam_3l:       null,
  foam_6l:       'p50_foam_6l_eco',
  foam_9l:       'p50_foam_9l',
  powder_2k:     'p50_powder_2k',
  powder_4k:     null,
  powder_6k:     'p50_powder_6k',
  powder_9k:     'p50_powder_9k',
  powder_12k:    null,
  wetchem_3l:    null,
  wetchem_6l:    'p50_wetchem_6l',
  wetchem_9l:    null,
}

export const INDUSTRIES = [
  'Banking & Finance',
  'Catering & Hospitality',
  'Education',
  'Food Manufacturing',
  'Health & Social Care',
  'Industrial & Warehousing',
  'Residential Care',
  'Retail',
  'Other',
]

export const STEEL_CATEGORIES = ['CO2', 'Water', 'Water Mist', 'Foam', 'Powder', 'Wet Chemical']
export const P50_CATEGORIES = ['Foam', 'Powder', 'Wet Chemical', 'Water Mist']

// Realistic default steel inventories per industry (quantities by steel type ID)
export const INDUSTRY_PRESETS: Record<string, Record<string, number>> = {
  'Banking & Finance': {
    co2_2k: 6, foam_2l: 4, powder_2k: 2,
  },
  'Catering & Hospitality': {
    co2_2k: 2, wetchem_6l: 8, foam_6l: 4, powder_2k: 2,
  },
  'Education': {
    co2_2k: 10, foam_6l: 20, powder_6k: 6, wetchem_6l: 4,
  },
  'Food Manufacturing': {
    co2_2k: 4, wetchem_6l: 12, foam_9l: 10, powder_6k: 6, watermist_6l: 6,
  },
  'Health & Social Care': {
    co2_2k: 4, watermist_6l: 12, wetchem_6l: 6, foam_6l: 8,
  },
  'Industrial & Warehousing': {
    co2_5k: 6, foam_9l: 20, powder_9k: 10, wetchem_6l: 6, watermist_6l: 4,
  },
  'Residential Care': {
    co2_2k: 2, watermist_6l: 8, wetchem_6l: 4, foam_2l: 6,
  },
  'Retail': {
    co2_2k: 2, foam_6l: 8, powder_6k: 4, wetchem_6l: 2,
  },
  'Other': {},
}
