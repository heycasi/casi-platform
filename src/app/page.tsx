'use client'

import { useState } from 'react'

export default function HomePage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setMessage('🎉 Thanks! We\'ll be in touch soon!')
      setEmail('')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          
          {/* Logo */}
          <div className="mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto shadow-2xl">
              <span className="text-4xl">🎮</span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-6xl font-bold bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-6">
            Casi Platform
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Real-time AI-powered streaming analytics that help creators understand their audience, catch every question, and grow their community.
          </p>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-3 text-green-400">Real-time Analytics</h3>
              <p className="text-gray-300">Live sentiment tracking and engagement scoring</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold mb-3 text-blue-400">AI Question Detection</h3>
              <p className="text-gray-300">Never miss important questions with smart priority scoring</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-4xl mb-4">📺</div>
              <h3 className="text-xl font-semibold mb-3 text-purple-400">OBS Integration</h3>
              <p className="text-gray-300">Beautiful stream overlays showing live engagement</p>
            </div>
          </div>

          {/* CTA */}
          <div className="max-w-md mx-auto">
            <h2 className="text-3xl font-bold mb-6">Ready to level up your streams?</h2>
            
            <form onSubmit={handleSubmit} className="mb-6">
              <div className="flex gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-blue-700 transition-all"
                >
                  Join Waitlist
                </button>
              </div>
            </form>

            {message && (
              <div className="p-3 rounded-lg bg-green-500/20 border border-green-500/50 text-green-400 mb-4">
                {message}
              </div>
            )}

            <button
              onClick={() => window.location.href = 'mailto:hello@heycasi.com'}
              className="w-full px-6 py-3 bg-white/10 border border-white/30 text-white rounded-lg hover:bg-white/20 transition-all"
            >
              Contact Us
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
