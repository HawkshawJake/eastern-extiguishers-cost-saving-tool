'use client'

import { useEffect, useState } from 'react'
import { getLeaderboard, type EventEntry } from '@/lib/eventStore'
import { formatCurrency } from '@/lib/calculations'
import { Trophy } from 'lucide-react'

const RANK_STYLES: Record<number, string> = {
  0: 'text-yellow-500',
  1: 'text-gray-400',
  2: 'text-amber-700',
}

function RankBadge({ index }: { index: number }) {
  const color = RANK_STYLES[index] ?? 'text-gray-300'
  if (index === 0) {
    return <Trophy size={16} className={color} strokeWidth={2.5} />
  }
  return (
    <span className={`font-heading font-black text-base w-4 text-center inline-block ${color}`}>
      {index + 1}
    </span>
  )
}

export default function Leaderboard() {
  const [entries, setEntries] = useState<EventEntry[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    getLeaderboard(10).then(data => {
      setEntries(data)
      setMounted(true)
    })

    const interval = setInterval(() => {
      getLeaderboard(10).then(setEntries)
    }, 30_000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden flex flex-col">
      <div className="bg-brand-red px-5 py-3">
        <h3 className="font-heading font-bold uppercase tracking-wide text-white text-lg">
          Top Savings Today
        </h3>
      </div>

      {!mounted || entries.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-12 px-5 text-center">
          <Trophy size={36} className="text-gray-200 mb-3" />
          <p className="font-body text-sm text-gray-400">
            {!mounted ? 'Loading…' : 'No entries yet — be the first!'}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {entries.map((entry, i) => (
            <div key={entry.id} className="flex items-center px-5 py-3 gap-3">
              <div className="w-5 flex items-center justify-center flex-shrink-0">
                <RankBadge index={i} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm font-semibold text-brand-black truncate">
                  {entry.company}
                </p>
                {entry.industry && (
                  <p className="font-body text-xs text-gray-400 truncate">{entry.industry}</p>
                )}
              </div>
              <p className="font-heading font-bold text-brand-red tabular-nums text-base flex-shrink-0">
                {formatCurrency(entry.saving)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
