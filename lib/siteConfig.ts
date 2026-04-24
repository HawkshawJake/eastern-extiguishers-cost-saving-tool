import { supabase } from './supabase'
import { STEEL_TYPES, P50_TYPES, type SteelType, type P50Type } from '@/data/extinguishers'
import { DEFAULT_CONSTANTS, type CalcConstants } from './calculations'

export interface SiteConfig {
  constants: CalcConstants
  steelTypes: SteelType[]
  p50Types: P50Type[]
}

export function defaultSiteConfig(): SiteConfig {
  return {
    constants: { ...DEFAULT_CONSTANTS },
    steelTypes: STEEL_TYPES.map(t => ({ ...t })),
    p50Types: P50_TYPES.map(t => ({ ...t })),
  }
}

export async function loadConfig(): Promise<SiteConfig> {
  try {
    const { data } = await supabase.from('config').select('data').single()
    if (!data?.data) return defaultSiteConfig()
    const stored = data.data as Partial<SiteConfig>
    const defaults = defaultSiteConfig()
    return {
      constants: { ...defaults.constants, ...(stored.constants ?? {}) },
      steelTypes: stored.steelTypes ?? defaults.steelTypes,
      p50Types: stored.p50Types ?? defaults.p50Types,
    }
  } catch {
    return defaultSiteConfig()
  }
}
