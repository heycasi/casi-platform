'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface BookDemoModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function BookDemoModal({ isOpen, onClose }: BookDemoModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    agencyName: '',
    rosterSize: '',
    painPoint: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // TODO: Implement actual form submission to your backend
    // For now, simulate submission
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSubmitting(false)
    setSubmitted(true)

    // Reset and close after 2 seconds
    setTimeout(() => {
      setSubmitted(false)
      onClose()
      setFormData({ email: '', agencyName: '', rosterSize: '', painPoint: '' })
    }, 2000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0f1119] border border-white/10 rounded-3xl shadow-2xl shadow-purple-900/20 overflow-hidden"
            >
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-blue-900/10 pointer-events-none" />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 z-10 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              {/* Content */}
              <div className="relative p-8 md:p-12">
                {!submitted ? (
                  <>
                    {/* Header */}
                    <div className="mb-8">
                      <h2 className="text-3xl md:text-4xl font-bold font-heading text-white mb-3">
                        <span className="bg-gradient-to-r from-[#6932FF] via-[#932FFE] to-[#5EEAD4] bg-clip-text text-transparent">
                          Upgrade Your Agency Infrastructure
                        </span>
                      </h2>
                      <p className="text-lg text-zinc-400 leading-relaxed">
                        Schedule a 20-minute walkthrough with our onboarding team. We'll tailor the
                        demo to your specific roster size and reporting needs.
                      </p>
                    </div>

                    {/* What to Expect */}
                    <div className="mb-8 space-y-4">
                      <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-zinc-500">
                        What to Expect
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mt-0.5">
                            <div className="w-2 h-2 rounded-full bg-purple-400" />
                          </div>
                          <div>
                            <div className="text-white font-semibold text-sm mb-1">
                              Live Command Center Tour
                            </div>
                            <div className="text-xs text-zinc-500 leading-relaxed">
                              See firsthand how to manage permissions, monitor live performance, and
                              track portfolio growth from a single dashboard.
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mt-0.5">
                            <div className="w-2 h-2 rounded-full bg-emerald-400" />
                          </div>
                          <div>
                            <div className="text-white font-semibold text-sm mb-1">
                              Campaign ROI Deep Dive
                            </div>
                            <div className="text-xs text-zinc-500 leading-relaxed">
                              Learn how to use our Sponsorship Benchmarks to prove value to brand
                              partners and secure larger contracts.
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mt-0.5">
                            <div className="w-2 h-2 rounded-full bg-amber-400" />
                          </div>
                          <div>
                            <div className="text-white font-semibold text-sm mb-1">
                              Migration Strategy
                            </div>
                            <div className="text-xs text-zinc-500 leading-relaxed">
                              Discuss high-volume onboarding (50+ talent) and how to transition your
                              team off spreadsheets seamlessly.
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mt-0.5">
                            <div className="w-2 h-2 rounded-full bg-blue-400" />
                          </div>
                          <div>
                            <div className="text-white font-semibold text-sm mb-1">
                              Enterprise Pricing Options
                            </div>
                            <div className="text-xs text-zinc-500 leading-relaxed">
                              Get a custom quote based on your roster volume, including bulk
                              discounts for agencies managing 20+ creators.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-zinc-300 mb-2"
                        >
                          Work Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="you@agency.com"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="agencyName"
                          className="block text-sm font-medium text-zinc-300 mb-2"
                        >
                          Agency / Organization Name
                        </label>
                        <input
                          type="text"
                          id="agencyName"
                          name="agencyName"
                          required
                          value={formData.agencyName}
                          onChange={handleChange}
                          placeholder="Your agency name"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="rosterSize"
                          className="block text-sm font-medium text-zinc-300 mb-2"
                        >
                          Roster Size
                        </label>
                        <select
                          id="rosterSize"
                          name="rosterSize"
                          required
                          value={formData.rosterSize}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all appearance-none cursor-pointer"
                        >
                          <option value="" disabled className="bg-[#0f1119] text-zinc-400">
                            Select roster size
                          </option>
                          <option value="1-5" className="bg-[#0f1119]">
                            1-5 creators
                          </option>
                          <option value="6-20" className="bg-[#0f1119]">
                            6-20 creators
                          </option>
                          <option value="21-50" className="bg-[#0f1119]">
                            21-50 creators
                          </option>
                          <option value="50+" className="bg-[#0f1119]">
                            50+ creators
                          </option>
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="painPoint"
                          className="block text-sm font-medium text-zinc-300 mb-2"
                        >
                          Current Pain Point{' '}
                          <span className="text-zinc-500 font-normal">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          id="painPoint"
                          name="painPoint"
                          value={formData.painPoint}
                          onChange={handleChange}
                          placeholder="e.g., Reporting, Team Access, Data Accuracy"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
                        />
                      </div>

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full px-8 py-4 bg-gradient-to-r from-[#6932FF] to-[#932FFE] text-white rounded-full font-bold hover:shadow-lg hover:shadow-[#6932FF]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
                      </button>

                      <p className="text-center text-xs text-zinc-500 mt-3">
                        Preferred by teams at leading talent agencies.
                      </p>
                    </form>
                  </>
                ) : (
                  <div className="py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-emerald-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Demo Request Submitted</h3>
                    <p className="text-zinc-400">
                      We'll reach out within 24 hours to schedule your personalized walkthrough.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
