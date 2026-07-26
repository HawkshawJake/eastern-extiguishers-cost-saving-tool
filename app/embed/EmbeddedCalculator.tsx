'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Flame } from 'lucide-react'
import WelcomeForm from '@/components/calculator/WelcomeForm'
import InventoryGrid from '@/components/calculator/InventoryGrid'
import ResultsView from '@/components/calculator/ResultsView'
import { useInventory } from '@/context/InventoryContext'
import { useConfig } from '@/context/ConfigContext'
import { removeStored } from '@/lib/safeStorage'
import { type Viewport } from '@/components/LeadCaptureModal'

type Step = 'welcome' | 'inventory' | 'results'

// Messages exchanged with the host page's loader script.
const HEIGHT_MESSAGE = 'eastern-calculator:height'
const SCROLL_MESSAGE = 'eastern-calculator:scroll'
const VIEWPORT_MESSAGE = 'eastern-calculator:viewport'

function post(message: Record<string, unknown>) {
  if (typeof window === 'undefined' || window.parent === window) return
  // Height and step changes carry nothing sensitive, so '*' is safe here and
  // saves the host site from having to be registered on our end.
  window.parent.postMessage(message, '*')
}

export default function EmbeddedCalculator({ showHeading }: { showHeading: boolean }) {
  const [step, setStep] = useState<Step>('welcome')
  const [viewport, setViewport] = useState<Viewport | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const { steelInventory, p50Inventory, resetInventory } = useInventory()
  const { steelTypes, p50Types } = useConfig()

  const hasData =
    steelTypes.some(t => (steelInventory[t.id] ?? 0) > 0) ||
    p50Types.some(t => (p50Inventory[t.id] ?? 0) > 0)

  // Keep the iframe exactly as tall as its content.
  useEffect(() => {
    const node = rootRef.current
    if (!node) return
    const report = () =>
      post({ type: HEIGHT_MESSAGE, height: Math.ceil(node.getBoundingClientRect().height) })
    report()
    const observer = new ResizeObserver(report)
    observer.observe(node)
    window.addEventListener('load', report)
    return () => {
      observer.disconnect()
      window.removeEventListener('load', report)
    }
  }, [])

  // The host page reports which slice of the frame is on screen, so overlays
  // can be centred on what the visitor is actually looking at.
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.source !== window.parent) return
      const data = event.data
      if (!data || typeof data !== 'object' || data.type !== VIEWPORT_MESSAGE) return
      const top = Number(data.top)
      const height = Number(data.height)
      if (!Number.isFinite(top) || !Number.isFinite(height)) return
      setViewport({ top: Math.max(0, top), height: Math.max(240, height) })
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  const goTo = useCallback((next: Step) => {
    setStep(next)
    post({ type: SCROLL_MESSAGE })
  }, [])

  function handleStartOver() {
    resetInventory()
    removeStored('ee_entry_id')
    removeStored('ee_lead_done')
    goTo('welcome')
  }

  return (
    <div ref={rootRef} className="relative bg-gray-50 px-5 py-8">
      <div className="max-w-3xl mx-auto">
        {step === 'welcome' && (
          <>
            {showHeading && (
              <div className="text-center mb-8">
                <div className="flex justify-center mb-3">
                  <Flame className="text-brand-red" size={32} strokeWidth={2} />
                </div>
                <h1 className="font-heading font-black text-3xl md:text-4xl uppercase text-brand-black leading-tight mb-3">
                  Cost Savings Calculator
                </h1>
                <p className="text-gray-500 font-body text-base leading-relaxed max-w-md mx-auto">
                  Compare your current extinguisher costs with a P50 solution in minutes.
                </p>
              </div>
            )}
            <div className="max-w-lg mx-auto">
              <WelcomeForm onStart={() => goTo('inventory')} />
            </div>
          </>
        )}

        {step === 'inventory' && (
          <>
            <div className="mb-6">
              <h2 className="font-heading font-black text-2xl md:text-3xl uppercase text-brand-black">
                Your Extinguisher Inventory
              </h2>
              <p className="font-body text-gray-500 mt-1">
                Enter the quantities you have now on the left. The matching P50 quantities are
                worked out for you.
              </p>
            </div>

            <InventoryGrid lockP50 />

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-end">
              <button className="btn-secondary" onClick={() => goTo('welcome')}>
                ← Back
              </button>
              <button
                className="btn-primary text-lg px-12 disabled:opacity-40"
                onClick={() => goTo('results')}
                disabled={!hasData}
              >
                Calculate Savings →
              </button>
            </div>
          </>
        )}

        {step === 'results' && (
          <div className="max-w-2xl mx-auto">
            <ResultsView
              source="website"
              onRecalculate={() => goTo('inventory')}
              onStartOver={handleStartOver}
              viewport={viewport}
            />
          </div>
        )}
      </div>
    </div>
  )
}
