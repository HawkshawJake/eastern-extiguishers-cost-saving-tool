'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { loadConfig, defaultSiteConfig, type SiteConfig } from '@/lib/siteConfig'
import { type CalcConstants } from '@/lib/calculations'
import { type SteelType, type P50Type } from '@/data/extinguishers'

interface ConfigContextValue {
  constants: CalcConstants
  steelTypes: SteelType[]
  p50Types: P50Type[]
  loading: boolean
}

const ConfigContext = createContext<ConfigContextValue>({
  ...defaultSiteConfig(),
  loading: true,
})

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<SiteConfig>(defaultSiteConfig())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadConfig().then(c => {
      setConfig(c)
      setLoading(false)
    })
  }, [])

  return (
    <ConfigContext.Provider value={{ ...config, loading }}>
      {children}
    </ConfigContext.Provider>
  )
}

export const useConfig = () => useContext(ConfigContext)
