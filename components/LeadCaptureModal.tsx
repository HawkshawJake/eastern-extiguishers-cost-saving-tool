'use client'

import { useState } from 'react'
import { Flame, X } from 'lucide-react'

interface Props {
  initialCompany: string
  saving: string
  onSubmit: (data: { company: string; email: string; phone: string }) => Promise<void>
  onDismiss: () => void
}

export default function LeadCaptureModal({ initialCompany, saving, onSubmit, onDismiss }: Props) {
  const [company, setCompany] = useState(initialCompany)
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!company.trim()) { setError('Please enter your company name.'); return }
    if (!email.trim()) { setError('Please enter your email address.'); return }
    setError('')
    setSubmitting(true)
    try {
      await onSubmit({ company: company.trim(), email: email.trim(), phone: phone.trim() })
      setDone(true)
      setTimeout(onDismiss, 2200)
    } catch {
      setError('Something went wrong — please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onDismiss}
      />

      {/* Card */}
      <div className="relative bg-white rounded-md shadow-xl w-full max-w-md overflow-hidden">
        {/* Close button */}
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {done ? (
          /* Success state */
          <div className="px-8 py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-eco-light flex items-center justify-center mx-auto mb-4">
              <Flame className="text-eco-green" size={22} />
            </div>
            <h2 className="font-heading font-bold text-xl uppercase text-brand-black mb-2">
              You're all set!
            </h2>
            <p className="font-body text-gray-500 text-sm">
              Our team will be in touch with your personalised report.
            </p>
          </div>
        ) : (
          /* Form */
          <>
            <div className="bg-brand-dark px-8 py-6">
              <div className="flex justify-center mb-3">
                <Flame className="text-brand-red-light" size={24} strokeWidth={2} />
              </div>
              <h2 className="font-heading font-bold text-xl uppercase text-white text-center leading-tight">
                Get Your Full Report
              </h2>
              <p className="font-body text-white/60 text-sm text-center mt-1">
                Save{' '}
                <span className="text-brand-red-light font-semibold">{saving}</span>
                {' '}— let us send you a personalised quote.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
              <div>
                <label className="block font-body text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
                  Company Name <span className="text-brand-red normal-case tracking-normal font-normal">*</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Acme Ltd"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  autoFocus={!initialCompany}
                />
              </div>

              <div>
                <label className="block font-body text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
                  Email Address <span className="text-brand-red normal-case tracking-normal font-normal">*</span>
                </label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="you@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoFocus={!!initialCompany}
                />
              </div>

              <div>
                <label className="block font-body text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
                  Phone Number{' '}
                  <span className="normal-case tracking-normal font-normal text-gray-400">(optional)</span>
                </label>
                <input
                  type="tel"
                  className="input-field"
                  placeholder="07700 900000"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </div>

              {error && (
                <p className="font-body text-sm text-brand-red">{error}</p>
              )}

              <button
                type="submit"
                className="btn-primary w-full text-base"
                disabled={submitting}
              >
                {submitting ? 'Sending…' : 'Send My Results →'}
              </button>

              <button
                type="button"
                onClick={onDismiss}
                className="w-full font-body text-sm text-gray-400 hover:text-gray-600 transition-colors py-1"
              >
                No thanks, just show me the results
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
