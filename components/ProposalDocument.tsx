import Image from 'next/image'
import { Leaf } from 'lucide-react'
import {
  calcTotals,
  formatCurrency,
  formatPercent,
  type CalcConstants,
} from '@/lib/calculations'
import { applyP50Pricing, type Proposal } from '@/lib/proposals'
import type { EventEntry } from '@/lib/eventStore'
import type { SteelType, P50Type } from '@/data/extinguishers'

interface Props {
  entry: EventEntry
  proposal: Proposal
  steelTypes: SteelType[]
  p50Types: P50Type[]
  constants: CalcConstants
}

function formatDate(iso?: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function ProposalDocument({ entry, proposal, steelTypes, p50Types, constants }: Props) {
  const years = proposal.comparison_years ?? 8
  const steel = entry.steel_inventory ?? {}
  const p50 = entry.p50_inventory ?? {}

  const discountedP50 = applyP50Pricing(p50Types, proposal.discount_pct, proposal.price_overrides)
  const totals = calcTotals(steel, p50, steelTypes, discountedP50, years, constants)

  const steelLines = steelTypes.filter(t => (steel[t.id] ?? 0) > 0)
  const p50Lines = discountedP50.filter(t => (p50[t.id] ?? 0) > 0)

  const hasDiscount = (proposal.discount_pct ?? 0) > 0
  const today = formatDate(new Date().toISOString())

  return (
    <div className="print-sheet bg-white text-brand-black mx-auto w-full max-w-[210mm] shadow-sm">
      {/* ── Header ── */}
      <div className="bg-brand-red px-10 py-7 flex items-center justify-between">
        <Image src="/logo.webp" alt="Eastern Extinguishers" width={220} height={44} className="h-10 w-auto" priority />
        <div className="text-right text-white">
          <p className="font-heading font-black uppercase text-2xl leading-none tracking-wide">
            Cost Savings Proposal
          </p>
          <p className="font-body text-white/70 text-xs mt-1">
            P50 Composite Extinguisher Programme
          </p>
        </div>
      </div>

      <div className="px-10 py-8">
        {/* ── Client / meta block ── */}
        <div className="proposal-section grid grid-cols-2 gap-8 pb-6 border-b border-gray-200">
          <div>
            <p className="font-body text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">
              Prepared For
            </p>
            <p className="font-heading font-bold text-xl text-brand-black leading-tight">{entry.company}</p>
            {proposal.contact_name && (
              <p className="font-body text-sm text-gray-700 mt-1">
                {proposal.contact_name}
                {proposal.contact_role && <span className="text-gray-400"> · {proposal.contact_role}</span>}
              </p>
            )}
            {proposal.site_address && (
              <p className="font-body text-sm text-gray-600 mt-1 whitespace-pre-line">{proposal.site_address}</p>
            )}
            <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2">
              {entry.industry && (
                <p className="font-body text-sm text-gray-600">
                  <span className="text-gray-400">Industry:</span> {entry.industry}
                </p>
              )}
              {proposal.num_sites != null && (
                <p className="font-body text-sm text-gray-600">
                  <span className="text-gray-400">Sites:</span> {proposal.num_sites}
                </p>
              )}
            </div>
            {entry.email && (
              <p className="font-body text-sm text-gray-600 mt-1">
                <span className="text-gray-400">Contact:</span> {entry.email}
                {entry.phone && <span> · {entry.phone}</span>}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="font-body text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">
              Proposal Details
            </p>
            <table className="ml-auto text-sm font-body">
              <tbody>
                <tr>
                  <td className="text-gray-400 pr-3 py-0.5 text-right">Date</td>
                  <td className="text-brand-black text-right">{today}</td>
                </tr>
                {proposal.reference && (
                  <tr>
                    <td className="text-gray-400 pr-3 py-0.5 text-right">Reference</td>
                    <td className="text-brand-black text-right">{proposal.reference}</td>
                  </tr>
                )}
                {proposal.prepared_by && (
                  <tr>
                    <td className="text-gray-400 pr-3 py-0.5 text-right">Prepared by</td>
                    <td className="text-brand-black text-right">{proposal.prepared_by}</td>
                  </tr>
                )}
                {proposal.valid_until && (
                  <tr>
                    <td className="text-gray-400 pr-3 py-0.5 text-right">Valid until</td>
                    <td className="text-brand-black text-right">{formatDate(proposal.valid_until)}</td>
                  </tr>
                )}
                {proposal.install_date && (
                  <tr>
                    <td className="text-gray-400 pr-3 py-0.5 text-right">Target install</td>
                    <td className="text-brand-black text-right">{formatDate(proposal.install_date)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Cover note ── */}
        {proposal.cover_note && (
          <div className="proposal-section py-6 border-b border-gray-200">
            <p className="font-body text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {proposal.cover_note}
            </p>
          </div>
        )}

        {/* ── Headline saving ── */}
        <div className="proposal-section my-6 bg-brand-dark rounded-md px-8 py-7 text-center">
          <p className="font-body text-white/50 uppercase tracking-widest text-[10px] mb-2">
            Projected saving over {years} years
          </p>
          <p className="font-heading font-black text-5xl text-brand-red-light leading-none tabular-nums">
            {formatCurrency(totals.saving)}
          </p>
          {totals.percentSaving > 0 && (
            <p className="font-body text-white/60 text-sm mt-2">
              {formatPercent(totals.percentSaving)} reduction on current steel costs ·{' '}
              {formatCurrency(totals.annualSaving)} per year
            </p>
          )}
        </div>

        {/* ── Cost comparison ── */}
        <div className="proposal-section mb-6">
          <h2 className="font-heading font-bold text-base uppercase tracking-wide text-brand-black mb-3">
            {years}-Year Cost Comparison
          </h2>
          <table className="w-full font-body text-sm border border-gray-200 rounded-md overflow-hidden">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left font-semibold text-gray-500 px-4 py-2">Programme</th>
                <th className="text-right font-semibold text-gray-500 px-4 py-2">Units</th>
                <th className="text-right font-semibold text-gray-500 px-4 py-2">{years}-Year Cost</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="px-4 py-2 text-gray-700">Current steel extinguishers</td>
                <td className="px-4 py-2 text-right tabular-nums text-gray-700">{totals.totalSteelUnits}</td>
                <td className="px-4 py-2 text-right tabular-nums text-gray-700">{formatCurrency(totals.totalSteelCost)}</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="px-4 py-2 text-gray-700">
                  Eastern P50 composite programme
                  {hasDiscount && (
                    <span className="text-eco-green text-xs"> (incl. {proposal.discount_pct}% discount)</span>
                  )}
                </td>
                <td className="px-4 py-2 text-right tabular-nums text-gray-700">{totals.totalP50Units}</td>
                <td className="px-4 py-2 text-right tabular-nums text-gray-700">{formatCurrency(totals.totalP50Cost)}</td>
              </tr>
              <tr className="bg-brand-red/5">
                <td className="px-4 py-2.5 font-semibold text-brand-black">Your saving</td>
                <td className="px-4 py-2.5 text-right tabular-nums text-eco-green">
                  {totals.totalSteelUnits > 0
                    ? `−${formatPercent((totals.totalSteelUnits - totals.totalP50Units) / totals.totalSteelUnits)}`
                    : '—'}
                </td>
                <td className="px-4 py-2.5 text-right font-heading font-bold text-brand-red tabular-nums">
                  {formatCurrency(totals.saving)}
                </td>
              </tr>
            </tbody>
          </table>
          <p className="font-body text-[11px] text-gray-400 mt-2">
            Includes unit purchase, installation, annual servicing, engineer call-outs and disposal over {years} years.
          </p>
        </div>

        {/* ── Inventory detail ── */}
        <div className="proposal-section grid grid-cols-2 gap-8 mb-6">
          <div>
            <h3 className="font-heading font-bold text-sm uppercase tracking-wide text-brand-black mb-2">
              Current Inventory
            </h3>
            {steelLines.length === 0 ? (
              <p className="font-body text-sm text-gray-400 italic">None recorded</p>
            ) : (
              <table className="w-full font-body text-sm">
                <tbody>
                  {steelLines.map(t => (
                    <tr key={t.id} className="border-b border-gray-100">
                      <td className="py-1.5 text-gray-600">{t.label}</td>
                      <td className="py-1.5 text-right tabular-nums font-semibold text-brand-black">×{steel[t.id]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div>
            <h3 className="font-heading font-bold text-sm uppercase tracking-wide text-brand-black mb-2">
              Recommended P50 Composite
            </h3>
            {p50Lines.length === 0 ? (
              <p className="font-body text-sm text-gray-400 italic">None recorded</p>
            ) : (
              <table className="w-full font-body text-sm">
                <tbody>
                  {p50Lines.map(t => (
                    <tr key={t.id} className="border-b border-gray-100">
                      <td className="py-1.5 text-gray-600">{t.label}</td>
                      <td className="py-1.5 text-right tabular-nums text-gray-400">{formatCurrency(t.clientCost)}</td>
                      <td className="py-1.5 text-right tabular-nums font-semibold text-brand-black w-12">×{p50[t.id]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ── Environmental ── */}
        {totals.co2Saving > 0 && (
          <div className="proposal-section mb-6 bg-eco-light border border-eco-green/30 rounded-md px-5 py-4 flex items-start gap-3">
            <Leaf className="text-eco-green flex-shrink-0 mt-0.5" size={20} strokeWidth={2} />
            <div>
              <p className="font-heading font-bold uppercase text-eco-green text-sm tracking-wide">
                Environmental Impact
              </p>
              <p className="font-body text-sm text-gray-700 mt-0.5">
                Switching to P50 cuts an estimated{' '}
                <span className="font-semibold text-brand-black">{totals.co2Saving.toFixed(1)} kg CO₂e</span>
                {' '}— a {formatPercent(totals.co2PercentReduction)} reduction versus your current steel fleet.
              </p>
            </div>
          </div>
        )}

        {/* ── Terms ── */}
        {(proposal.payment_terms || proposal.warranty_notes || proposal.valid_until) && (
          <div className="proposal-section mb-6 border-t border-gray-200 pt-4">
            <h3 className="font-heading font-bold text-sm uppercase tracking-wide text-brand-black mb-2">
              Terms
            </h3>
            <div className="space-y-1.5">
              {proposal.valid_until && (
                <p className="font-body text-sm text-gray-600">
                  <span className="text-gray-400">Quote valid until:</span> {formatDate(proposal.valid_until)}
                </p>
              )}
              {proposal.payment_terms && (
                <p className="font-body text-sm text-gray-600 whitespace-pre-line">
                  <span className="text-gray-400">Payment:</span> {proposal.payment_terms}
                </p>
              )}
              {proposal.warranty_notes && (
                <p className="font-body text-sm text-gray-600 whitespace-pre-line">
                  <span className="text-gray-400">Warranty &amp; maintenance:</span> {proposal.warranty_notes}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <div className="proposal-section border-t border-gray-200 pt-4 mt-6">
          <p className="font-body text-[11px] text-gray-400 leading-relaxed">
            Figures are estimates based on the inventory provided and typical service, exchange, installation and
            disposal charges over a {years}-year period. This proposal is indicative and does not constitute a
            contractual offer. Speak to your Eastern Extinguishers advisor for a fully tailored quotation.
          </p>
          <p className="font-body text-[11px] text-gray-300 mt-2">
            Eastern Extinguishers · Fire safety, simplified.
          </p>
        </div>
      </div>
    </div>
  )
}
