'use client'

import { useEffect, useState } from 'react'

type SponsorReportConfig = {
  campaignName: string
  dateRangeStart: string
  dateRangeEnd: string
  notes?: string
}

type SponsorReportResult = {
  reportUrl: string
  reportId?: string
}

export default function SponsorReportGenerator({
  isOpen,
  onClose,
  campaignName,
  defaultStartDate,
  defaultEndDate,
  onGenerate,
}: {
  isOpen: boolean
  onClose: () => void
  campaignName: string
  defaultStartDate: string
  defaultEndDate: string
  onGenerate: (config: SponsorReportConfig) => Promise<SponsorReportResult>
}) {
  const [startDate, setStartDate] = useState(defaultStartDate)
  const [endDate, setEndDate] = useState(defaultEndDate)
  const [notes, setNotes] = useState('')
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reportLink, setReportLink] = useState('')

  // Reset state whenever the modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('form')
      setError(null)
      setReportLink('')
      setNotes('')
      setStartDate(defaultStartDate)
      setEndDate(defaultEndDate)
    }
  }, [isOpen, defaultStartDate, defaultEndDate])

  if (!isOpen) return null

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      const result = await onGenerate({
        campaignName,
        dateRangeStart: startDate,
        dateRangeEnd: endDate,
        notes: notes || undefined,
      })

      if (!result.reportUrl) {
        setError('Report created but no link returned.')
        setIsGenerating(false)
        return
      }

      setReportLink(result.reportUrl)
      setStep('success')
    } catch (err) {
      console.error(err)
      setError('Failed to generate report')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleView = () => {
    if (!reportLink) return
    window.open(reportLink, '_blank')
  }

  const handleCopy = () => {
    if (!reportLink) return
    navigator.clipboard.writeText(reportLink).catch(console.error)
  }

  const handleClose = () => {
    setStep('form')
    setError(null)
    setNotes('')
    setReportLink('')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div className="bg-slate-900 max-w-xl w-full rounded-2xl border border-white/10 p-6 shadow-xl">
        {step === 'form' && (
          <>
            <h2 className="text-xl font-bold text-white mb-1">Generate Sponsor Report</h2>
            <p className="text-slate-400 text-sm mb-6">
              Select a date range to create a branded, sponsor-ready performance report.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Campaign</label>
                <input
                  disabled
                  value={campaignName}
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 mb-1 block">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1 block">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 resize-none"
                  rows={3}
                />
              </div>

              {error && (
                <div className="bg-red-900/40 border border-red-600 text-red-200 px-3 py-2 rounded-lg text-xs">
                  {error}
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleClose}
                className="flex-1 bg-slate-800/50 text-slate-300 px-4 py-2 rounded-lg"
                disabled={isGenerating}
              >
                Cancel
              </button>

              <button
                onClick={handleGenerate}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-semibold shadow disabled:opacity-50"
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating…' : 'Generate'}
              </button>
            </div>
          </>
        )}

        {step === 'success' && (
          <>
            <h2 className="text-xl font-bold text-white mb-4 text-center">Report Ready! 🎉</h2>

            <div className="space-y-3 mb-6">
              <input
                readOnly
                value={reportLink}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleCopy}
                  className="flex-1 bg-slate-800/50 text-slate-200 px-4 py-2 rounded-lg"
                  disabled={!reportLink}
                >
                  Copy Link
                </button>
                <button
                  onClick={handleView}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg"
                  disabled={!reportLink}
                >
                  View Report
                </button>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-full text-xs text-slate-400 hover:text-slate-200"
            >
              Close
            </button>
          </>
        )}
      </div>
    </div>
  )
}
