'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import { type CostPoint, formatCurrency, formatYAxis } from '@/lib/calculations'

interface TooltipEntry { dataKey?: string; value?: number }
interface CustomTooltipProps { active?: boolean; payload?: TooltipEntry[]; label?: number }

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const steel = payload.find(p => p.dataKey === 'steel')?.value ?? 0
  const p50 = payload.find(p => p.dataKey === 'p50')?.value ?? 0
  const saving = steel - p50
  return (
    <div className="bg-white border border-gray-200 rounded shadow-md p-3 text-sm font-body">
      <p className="font-semibold text-brand-black mb-2">Year {label}</p>
      <p className="text-gray-500">Steel: <span className="font-semibold text-brand-black">{formatCurrency(steel)}</span></p>
      <p className="text-gray-500">P50: <span className="font-semibold text-brand-red">{formatCurrency(p50)}</span></p>
      {saving > 0 && (
        <p className="text-eco-green font-semibold mt-1 pt-1 border-t border-gray-100">
          Saving: {formatCurrency(saving)}
        </p>
      )}
    </div>
  )
}

interface Props {
  data: CostPoint[]
  breakEvenYear: number | null
  height?: number | string
}

export default function CumulativeCostChart({ data, breakEvenYear, height = 300 }: Props) {
  const breakEvenX = breakEvenYear !== null ? Math.ceil(breakEvenYear) : undefined

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 20, left: 10, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E4" />
        <XAxis
          dataKey="year"
          tick={{ fontSize: 11, fill: '#8E8E8E', fontFamily: 'var(--font-body)' }}
          label={{ value: 'Year', position: 'insideBottomRight', offset: -8, fontSize: 11, fill: '#8E8E8E' }}
        />
        <YAxis
          tickFormatter={formatYAxis}
          tick={{ fontSize: 11, fill: '#8E8E8E', fontFamily: 'var(--font-body)' }}
          width={56}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value: string) => (
            <span style={{ fontSize: 12, color: '#4A4A4A', fontFamily: 'var(--font-body)' }}>
              {value === 'steel' ? 'Steel (cumulative)' : 'P50 (cumulative)'}
            </span>
          )}
        />
        {breakEvenX !== undefined && (
          <ReferenceLine
            x={breakEvenX}
            stroke="#2E7D32"
            strokeDasharray="5 3"
            strokeWidth={1.5}
            label={{
              value: `Break-even yr ${breakEvenX}`,
              position: 'top',
              fontSize: 10,
              fill: '#2E7D32',
              fontFamily: 'var(--font-body)',
            }}
          />
        )}
        <Line
          type="monotone"
          dataKey="steel"
          stroke="#4A4A4A"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 4, fill: '#4A4A4A' }}
        />
        <Line
          type="monotone"
          dataKey="p50"
          stroke="#B8241C"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 4, fill: '#B8241C' }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
