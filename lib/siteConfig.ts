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

/** Layers the admin's saved overrides on top of the hardcoded defaults. */
export function mergeStoredConfig(stored: unknown): SiteConfig {
  const defaults = defaultSiteConfig()
  if (!stored || typeof stored !== 'object') return defaults
  const partial = stored as Partial<SiteConfig>
  return {
    constants: { ...defaults.constants, ...(partial.constants ?? {}) },
    steelTypes: mergeTypes(defaults.steelTypes, partial.steelTypes),
    p50Types: mergeTypes(defaults.p50Types, partial.p50Types),
  }
}

export async function loadConfig(): Promise<SiteConfig> {
  try {
    const res = await fetch('/api/config', { cache: 'no-store' })
    const json = await res.json()
    return json.config ? mergeStoredConfig(json.config) : defaultSiteConfig()
  } catch {
    return defaultSiteConfig()
  }
}
