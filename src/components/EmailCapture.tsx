'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface EmailCaptureProps {
  source: string
  title?: string
  description?: string
  placeholder?: string
  buttonText?: string
  className?: string
}

export default function EmailCapture({
  source,
  title = "Join the Beta",
  description = "Get early access to Casi Platform",
  placeholder = "your@email.com",
  buttonText = "Join Beta",
  className = ""
}: EmailCaptureProps) {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    if (!email) {
      setMessage('Please enter your email address')
      setIsSubmitting(false)
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setMessage('Please enter a valid email address')
      setIsSubmitting(false)
      return
    }

    try {
      const { error } = await supabase
        .from('waitlist')
        .insert([
          {
            email: email.toLowerCase().trim(),
            source: source,
            user_agent: navigator.userAgent,
            created_at: new Date().toISOString()
          }
        ])

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          setMessage('You\'re already signed up! Check your email for updates.')
          setIsSuccess(true)
        } else {
          setMessage('Something went wrong. Please try again.')
          console.error('Supabase error:', error)
        }
      } else {
        setMessage('🎉 Welcome to the beta! Check your email for next steps.')
        setIsSuccess(true)
        setEmail('')
      }
    } catch (error: unknown) {
      console.error('Error:', error)
      setMessage('Something went wrong. Please try again.')
    }

    setIsSubmitting(false)
  }

  if (isSuccess && message.includes('Welcome')) {
    return (
      <div className={`bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center ${className}`}>
        <div className="text-4xl mb-4">🎉</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">You're In!</h3>
        <p className="text-gray-600 mb-4">{message}</p>
        <div className="space-y-3">
          <a
            href="https://discord.gg/casi" // Replace with actual Discord invite
            className="block bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Join Discord Community
          </a>
          <a
            href="/dashboard-preview"
            className="block bg-gray-100 text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Preview Dashboard
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-200 p-6 ${className}`}>
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder={placeholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
          required
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          data-event={`cta-email-capture-${source}`}
        >
          {isSubmitting ? 'Joining...' : buttonText}
        </button>
      </form>

      {message && (
        <div className={`mt-4 text-center p-3 rounded-lg ${
          message.includes('wrong') || message.includes('valid')
            ? 'bg-red-50 text-red-700 border border-red-200'
            : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {message}
        </div>
      )}
    </div>
  )
}