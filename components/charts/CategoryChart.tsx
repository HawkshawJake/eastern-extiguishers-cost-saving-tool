'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { type CategoryBreakdown, formatCurrency, formatYAxis } from '@/lib/calculations'

interface TooltipEntry { dataKey?: string; value?: number }
interface CustomTooltipProps { active?: boolean; payload?: TooltipEntry[]; label?: string }

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const steel = payload.find(p => p.dataKey === 'steel')?.value ?? 0
  const p50 = payload.find(p => p.dataKey === 'p50')?.value ?? 0
  return (
    <div className="bg-white border border-gray-200 rounded shadow-md p-3 text-sm font-body">
      <p className="font-semibold text-brand-black mb-2">{label}</p>
      <p className="text-gray-500">Steel: <span className="font-semibold text-brand-black">{formatCurrency(steel)}</span></p>
      {p50 > 0 && (
        <p className="text-gray-500">P50: <span className="font-semibold text-brand-red">{formatCurrency(p50)}</span></p>
      )}
      {steel > 0 && p50 > 0 && (
        <p className="text-eco-green font-semibold mt-1 pt-1 border-t border-gray-100">
          Saving: {formatCurrency(steel - p50)}
        </p>
      )}
      {p50 === 0 && steel > 0 && (
        <p className="text-gray-400 text-xs mt-1">No P50 equivalent available</p>
      )}
    </div>
  )
}

interface Props {
  data: CategoryBreakdown[]
}

export default function CategoryChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 20, left: 10, bottom: 8 }} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E4" vertical={false} />
        <XAxis
          dataKey="category"
          tick={{ fontSize: 11, fill: '#8E8E8E', fontFamily: 'var(--font-body)' }}
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
              {value === 'steel' ? 'Steel' : 'P50'}
            </span>
          )}
        />
        <Bar dataKey="steel" name="steel" fill="#4A4A4A" radius={[3, 3, 0, 0]} maxBarSize={40} />
        <Bar dataKey="p50" name="p50" fill="#B8241C" radius={[3, 3, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  )
}
