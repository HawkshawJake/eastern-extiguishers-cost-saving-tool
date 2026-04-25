'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { loadConfig, defaultSiteConfig, type SiteConfig } from '@/lib/siteConfig'
import { type CalcConstants } from '@/lib/calculations'
import { type SteelType, type P50Type } from '@/data/extinguishers'

interface ConfigContextValue {
  constants: CalcConstants
  steelTypes: SteelType[]
  p50Types: P50Type[]
  loading: boolean
  reloadConfig: () => Promise<void>
}

const ConfigContext = createContext<ConfigContextValue>({
  ...defaultSiteConfig(),
  loading: true,
  reloadConfig: async () => {},
})

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<SiteConfig>(defaultSiteConfig())
  const [loading, setLoading] = useState(true)

  const fetchConfig = useCallback(async () => {
    const c = await loadConfig()
    setConfig(c)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchConfig()
  }, [fetchConfig])

  return (
    <ConfigContext.Provider value={{ ...config, loading, reloadConfig: fetchConfig }}>
      {children}
    </ConfigContext.Provider>
  )
}

export const useConfig = () => useContext(ConfigContext)
