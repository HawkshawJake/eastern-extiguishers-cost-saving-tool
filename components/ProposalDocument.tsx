import Image from 'next/image'
import { Leaf, Check } from 'lucide-react'
import {
  calcTotals,
  calcCumulativeCosts,
  findBreakEvenYear,
  formatCurrency,
  formatPercent,
  type CalcConstants,
} from '@/lib/calculations'
import {
  applyP50Pricing,
  quoteTotals,
  effectiveP50Inventory,
  type Proposal,
} from '@/lib/proposals'
import type { EventEntry } from '@/lib/eventStore'
import type { SteelType, P50Type } from '@/data/extinguishers'

interface Props {
  entry: EventEntry
  proposal: Proposal
  steelTypes: SteelType[]
  p50Types: P50Type[]
  constants: CalcConstants
}

const P50_BENEFITS = [
  ['No annual service contract', 'P50 units are self-maintained with a simple monthly visual check by your own staff — no recurring engineer service visits.'],
  ['10-year guarantee', 'Each P50 extinguisher is supplied with a 10-year guarantee and a 20-year design life, versus the typical 5-year steel replacement cycle.'],
  ['Lighter & safer to handle', 'Corrosion-free composite bodies are significantly lighter than steel and will never rust internally.'],
  ['Fewer units to manage', 'Multi-risk P50 units typically reduce the total number of extinguishers you need to own and track.'],
  ['Lower carbon footprint', 'Longer life and fewer replacements mean materially less embodied CO₂ over the life of your fleet.'],
]

function formatDate(iso?: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function money2(n: number): string {
  return `£${n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function ProposalDocument({ entry, proposal, steelTypes, p50Types, constants }: Props) {
  const years = proposal.comparison_years ?? 8
  const steel = entry.steel_inventory ?? {}
  const lineItems = proposal.line_items ?? []

  // The quote — actual costs the engineer has entered.
  const quote = quoteTotals(lineItems, proposal.discount_pct, proposal.vat_rate)

  // The saving / forward projection, using the engineer's P50 quantities where known.
  const effP50 = effectiveP50Inventory(proposal, entry, p50Types)
  const discountedP50 = applyP50Pricing(p50Types, proposal.discount_pct)
  const totals = calcTotals(steel, effP50, steelTypes, discountedP50, years, constants)
  const cumulative = calcCumulativeCosts(steel, effP50, steelTypes, discountedP50, years, constants)
  const breakEvenYear = findBreakEvenYear(
    calcCumulativeCosts(steel, effP50, steelTypes, discountedP50, 30, constants),
  )
  const breakEvenRow = breakEvenYear !== null ? Math.ceil(breakEvenYear) : null

  const today = formatDate(new Date().toISOString())
  const hasDiscount = (proposal.discount_pct ?? 0) > 0
  const hasVat = (proposal.vat_rate ?? 0) > 0

  return (
    <div className="print-sheet bg-white text-brand-black mx-auto w-full max-w-[210mm] shadow-sm">
      {/* ── Header ── */}
      <div className="bg-brand-red px-10 py-7 flex items-center justify-between">
        <Image src="/logo.webp" alt="Eastern Extinguishers" width={220} height={44} className="h-10 w-auto" priority />
        <div className="text-right text-white">
          <p className="font-heading font-black uppercase text-2xl leading-none tracking-wide">
            P50 Installation Quote
          </p>
          <p className="font-body text-white/70 text-xs mt-1">
            Composite Fire Extinguisher Programme
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
              Quote Details
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
                    <td className="text-gray-400 pr-3 py-0.5 text-right">Surveyed by</td>
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

        {/* ── The quote (checkout) ── */}
        <div className="proposal-section my-6">
          <h2 className="font-heading font-bold text-base uppercase tracking-wide text-brand-black mb-3">
            Your Quote
          </h2>
          {lineItems.length === 0 ? (
            <p className="font-body text-sm text-gray-400 italic border border-dashed border-gray-200 rounded-md px-4 py-6 text-center">
              No items added yet. The surveying engineer will add the recommended units and works here.
            </p>
          ) : (
            <table className="w-full font-body text-sm border border-gray-200 rounded-md overflow-hidden">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left font-semibold text-gray-500 px-4 py-2">Item</th>
                  <th className="text-right font-semibold text-gray-500 px-4 py-2 w-16">Qty</th>
                  <th className="text-right font-semibold text-gray-500 px-4 py-2 w-28">Unit Price</th>
                  <th className="text-right font-semibold text-gray-500 px-4 py-2 w-32">Total</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map(li => (
                  <tr key={li.id} className="border-b border-gray-100">
                    <td className="px-4 py-2 text-gray-700">{li.description || <span className="text-gray-300 italic">Untitled item</span>}</td>
                    <td className="px-4 py-2 text-right tabular-nums text-gray-700">{li.qty}</td>
                    <td className="px-4 py-2 text-right tabular-nums text-gray-700">{money2(li.unit_price)}</td>
                    <td className="px-4 py-2 text-right tabular-nums text-gray-700">{money2((li.qty || 0) * (li.unit_price || 0))}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-200">
                  <td colSpan={2} className="px-4 py-1.5" />
                  <td className="px-4 py-1.5 text-right font-body text-gray-500">Subtotal</td>
                  <td className="px-4 py-1.5 text-right tabular-nums text-gray-700">{money2(quote.subtotal)}</td>
                </tr>
                {hasDiscount && (
                  <tr>
                    <td colSpan={2} className="px-4 py-1.5" />
                    <td className="px-4 py-1.5 text-right font-body text-eco-green">Discount ({proposal.discount_pct}%)</td>
                    <td className="px-4 py-1.5 text-right tabular-nums text-eco-green">−{money2(quote.discount)}</td>
                  </tr>
                )}
                {hasVat && (
                  <tr>
                    <td colSpan={2} className="px-4 py-1.5" />
                    <td className="px-4 py-1.5 text-right font-body text-gray-500">VAT ({proposal.vat_rate}%)</td>
                    <td className="px-4 py-1.5 text-right tabular-nums text-gray-700">{money2(quote.vat)}</td>
                  </tr>
                )}
                <tr className="bg-brand-red/5 border-t border-gray-200">
                  <td colSpan={2} className="px-4 py-2.5" />
                  <td className="px-4 py-2.5 text-right font-heading font-bold uppercase tracking-wide text-brand-black">
                    Total Investment
                  </td>
                  <td className="px-4 py-2.5 text-right font-heading font-bold text-lg text-brand-red tabular-nums">
                    {money2(quote.total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
          <p className="font-body text-[11px] text-gray-400 mt-2">
            One-off supply &amp; installation of your P50 composite fire extinguisher fleet
            {hasVat ? ', inclusive of VAT.' : '.'}
          </p>
        </div>

        {/* ── Your saving ── */}
        {totals.saving > 0 && (
          <div className="proposal-section my-6 grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-md p-4 text-center">
              <p className="font-body text-[10px] text-gray-400 uppercase tracking-wide mb-1">Staying on steel · {years} yrs</p>
              <p className="font-heading font-bold text-xl text-brand-black tabular-nums">{formatCurrency(totals.totalSteelCost)}</p>
            </div>
            <div className="bg-gray-50 rounded-md p-4 text-center">
              <p className="font-body text-[10px] text-gray-400 uppercase tracking-wide mb-1">With P50 · {years} yrs</p>
              <p className="font-heading font-bold text-xl text-brand-black tabular-nums">{formatCurrency(totals.totalP50Cost)}</p>
            </div>
            <div className="bg-brand-dark rounded-md p-4 text-center">
              <p className="font-body text-[10px] text-white/50 uppercase tracking-wide mb-1">You save</p>
              <p className="font-heading font-black text-xl text-brand-red-light tabular-nums">{formatCurrency(totals.saving)}</p>
              {totals.percentSaving > 0 && (
                <p className="font-body text-[10px] text-white/50 mt-0.5">{formatPercent(totals.percentSaving)} less</p>
              )}
            </div>
          </div>
        )}

        {/* ── How it looks moving forward ── */}
        {cumulative.length > 1 && totals.saving > 0 && (
          <div className="proposal-section mb-6">
            <h2 className="font-heading font-bold text-base uppercase tracking-wide text-brand-black mb-1">
              How It Looks Moving Forward
            </h2>
            <p className="font-body text-[11px] text-gray-400 mb-3">
              Cumulative cost of staying on steel versus switching to P50, year by year.
              {breakEvenRow && ` P50 pays for itself in year ${breakEvenRow}.`}
            </p>
            <table className="w-full font-body text-sm border border-gray-200 rounded-md overflow-hidden">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left font-semibold text-gray-500 px-4 py-2">Year</th>
                  <th className="text-right font-semibold text-gray-500 px-4 py-2">Steel (cumulative)</th>
                  <th className="text-right font-semibold text-gray-500 px-4 py-2">P50 (cumulative)</th>
                  <th className="text-right font-semibold text-gray-500 px-4 py-2">Running saving</th>
                </tr>
              </thead>
              <tbody>
                {cumulative.filter(p => p.year > 0).map(p => {
                  const saving = p.steel - p.p50
                  const isBreakEven = breakEvenRow === p.year
                  return (
                    <tr key={p.year} className={`border-b border-gray-100 ${isBreakEven ? 'bg-eco-light' : ''}`}>
                      <td className="px-4 py-1.5 text-gray-700">
                        Year {p.year}
                        {isBreakEven && <span className="text-eco-green text-xs font-semibold"> · break-even</span>}
                      </td>
                      <td className="px-4 py-1.5 text-right tabular-nums text-gray-600">{formatCurrency(p.steel)}</td>
                      <td className="px-4 py-1.5 text-right tabular-nums text-gray-600">{formatCurrency(p.p50)}</td>
                      <td className={`px-4 py-1.5 text-right tabular-nums font-semibold ${saving >= 0 ? 'text-eco-green' : 'text-gray-400'}`}>
                        {saving >= 0 ? formatCurrency(saving) : `−${formatCurrency(-saving)}`}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Why P50 (benefits) ── */}
        <div className="proposal-section mb-6">
          <h2 className="font-heading font-bold text-base uppercase tracking-wide text-brand-black mb-3">
            Why Switch to P50
          </h2>
          <div className="grid grid-cols-1 gap-2.5">
            {P50_BENEFITS.map(([title, body]) => (
              <div key={title} className="flex items-start gap-3">
                <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-eco-light flex items-center justify-center">
                  <Check size={12} className="text-eco-green" strokeWidth={3} />
                </span>
                <p className="font-body text-sm text-gray-600">
                  <span className="font-semibold text-brand-black">{title}.</span> {body}
                </p>
              </div>
            ))}
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
            This quote reflects the units and works surveyed on site. Savings figures are estimates based on the
            inventory provided and typical service, exchange, installation and disposal charges over a {years}-year
            period. Prices are valid until the date shown above. Speak to your Eastern Extinguishers advisor with any
            questions.
          </p>
          <p className="font-body text-[11px] text-gray-300 mt-2">
            Eastern Extinguishers · Fire safety, simplified.
          </p>
        </div>
      </div>
    </div>
  )
}
