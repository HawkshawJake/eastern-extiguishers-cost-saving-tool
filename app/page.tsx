'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Flame } from 'lucide-react'
import Header from '@/components/Header'
import DayCounter from '@/components/DayCounter'
import Leaderboard from '@/components/Leaderboard'
import WelcomeForm from '@/components/calculator/WelcomeForm'
import { getStored } from '@/lib/safeStorage'

export default function WelcomePage() {
  const router = useRouter()
  const [hasSession, setHasSession] = useState(false)

  useEffect(() => {
    setHasSession(!!getStored('ee_session_id'))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      {hasSession && <DayCounter />}

      <main className="flex-1 px-5 py-8 md:py-10">
        <div className="max-w-4xl mx-auto">
          {/* Page heading */}
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

          {/* Form + optional leaderboard */}
          <div className={hasSession ? 'grid grid-cols-1 lg:grid-cols-2 gap-6 items-start' : 'max-w-lg mx-auto'}>
            <WelcomeForm onStart={() => router.push('/calculator')} />

            {/* Leaderboard — only shown when accessed via a session link */}
            {hasSession && <Leaderboard />}
          </div>
        </div>
      </main>
    </div>
  )
}
