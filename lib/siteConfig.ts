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

function mergeTypes<T extends { id: string }>(defaults: T[], stored: T[] | undefined): T[] {
  if (!stored) return defaults
  const storedMap = new Map(stored.map(t => [t.id, t]))
  return defaults.map(t => storedMap.has(t.id) ? { ...t, ...storedMap.get(t.id)! } : t)
}

export async function loadConfig(): Promise<SiteConfig> {
  try {
    const { data } = await supabase.from('config').select('data').single()
    if (!data?.data) return defaultSiteConfig()
    const stored = data.data as Partial<SiteConfig>
    const defaults = defaultSiteConfig()
    return {
      constants: { ...defaults.constants, ...(stored.constants ?? {}) },
      steelTypes: mergeTypes(defaults.steelTypes, stored.steelTypes),
      p50Types: mergeTypes(defaults.p50Types, stored.p50Types),
    }
  } catch {
    return defaultSiteConfig()
  }
}
