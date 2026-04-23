'use client'

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from 'react'
import { STEEL_TO_P50_MAP, INDUSTRY_PRESETS } from '@/data/extinguishers'

interface AppState {
  company: string
  industry: string
  steelInventory: Record<string, number>
  p50Inventory: Record<string, number>
}

interface AppContextValue extends AppState {
  setCompany: (v: string) => void
  setIndustry: (v: string) => void
  setSteelQty: (id: string, qty: number) => void
  setP50Qty: (id: string, qty: number) => void
  applyPreset: (industryKey: string) => void
  resetInventory: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [company, setCompany] = useState('')
  const [industry, setIndustry] = useState('')
  const [steelInventory, setSteelInventory] = useState<Record<string, number>>({})
  const [p50Inventory, setP50Inventory] = useState<Record<string, number>>({})
  // tracks which P50 fields the user has manually edited
  const [p50Touched, setP50Touched] = useState<Set<string>>(new Set())

  const setSteelQty = useCallback(
    (id: string, qty: number) => {
      setSteelInventory(prev => ({ ...prev, [id]: qty }))
      const p50Id = STEEL_TO_P50_MAP[id]
      if (p50Id && !p50Touched.has(p50Id)) {
        setP50Inventory(prev => ({ ...prev, [p50Id]: qty }))
      }
    },
    [p50Touched],
  )

  const setP50Qty = useCallback((id: string, qty: number) => {
    setP50Inventory(prev => ({ ...prev, [id]: qty }))
    setP50Touched(prev => new Set([...prev, id]))
  }, [])

  const applyPreset = useCallback((industryKey: string) => {
    const preset = INDUSTRY_PRESETS[industryKey] ?? { steel: {}, p50: {} }
    setSteelInventory(preset.steel)
    setP50Inventory(preset.p50)
    setP50Touched(new Set())
  }, [])

  const resetInventory = useCallback(() => {
    setSteelInventory({})
    setP50Inventory({})
    setP50Touched(new Set())
  }, [])

  const value = useMemo(
    () => ({
      company,
      industry,
      steelInventory,
      p50Inventory,
      setCompany,
      setIndustry,
      setSteelQty,
      setP50Qty,
      applyPreset,
      resetInventory,
    }),
    [company, industry, steelInventory, p50Inventory, setSteelQty, setP50Qty, applyPreset, resetInventory],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useInventory(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useInventory must be used within InventoryProvider')
  return ctx
}
