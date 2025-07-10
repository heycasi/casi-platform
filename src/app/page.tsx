'use client'

import React, { useState } from 'react'

export default function HomePage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !email.includes('@')) {
      setMessage('❌ Please enter a valid email address.')
      return
    }

    setMessage('🎉 Thanks! We\'ll be in touch soon!')
    setEmail('')
    
    console.log('Waitlist signup:', email)
  }

  const handleContactClick = () => {
    window.location.href = 'mailto:hello@heycasi.com?subject=Casi Platform Inquiry'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
            backgroundSize: '20px 20px'
          }}
        />
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        
        {/* Logo Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300">
              <img 
                src="/landing-logo.png" 
                alt="Casi Platform Logo" 
                className="w-16 h-16 object-contain"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement
                  target.style.display = 'none'
                  const fallback = target.nextElementSibling as HTMLElement
                  if (fallback) fallback.style.display = 'block'
                }}
              />
              <span className="text-4xl font-bold text-white hidden">🎮</span>
            </div>
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-6">
            Casi Platform
          </h1>
          
          <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Real-time AI-powered streaming analytics that help creators{' '}
            <span className="text-green-400 font-semibold">understand their audience</span>,{' '}
            <span className="text-blue-400 font-semibold">catch every question</span>, and{' '}
            <span className="text-purple-400 font-semibold">grow their community</span>
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-3 text-green-400">Real-time Analytics</h3>
            <p className="text-gray-300">Live sentiment tracking and engagement scoring for every message in your chat</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-3 text-blue-400">AI Question Detection</h3>
            <p className="text-gray-300">Never miss important questions again with intelligent priority scoring</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
            <div className="text-4xl mb-4">📺</div>
            <h3 className="text-xl font-semibold mb-3 text-purple-400">OBS Integration</h3>
            <p className="text-gray-300">Beautiful stream overlays that show your community engagement live</p>
          </div>
          
        </div>

        {/* Robot Mascot */}
        <div className="mb-12">
          <div className="w-32 h-32 mx-auto">
            <img 
              src="/landing-robot.png" 
              alt="Casi Robot" 
              className="w-full h-full object-contain animate-bounce"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement
                target.style.display = 'none'
                const fallback = target.nextElementSibling as HTMLElement
                if (fallback) fallback.style.display = 'block'
              }}
            />
            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-6xl animate-bounce hidden">
              🤖
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center max-w-md mx-auto">
          <h2 className="text-3xl font-bold mb-6">Ready to level up your streams?</h2>
          
          <form onSubmit={handleSubmit} className="mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-4 py-3 rounded-lg bg-white/10 backdrop-blur-lg border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Join Waitlist
              </button>
            </div>
          </form>

          {message && (
            <div className={`p-3 rounded-lg mb-4 ${
              message.includes('🎉') 
                ? 'bg-green-500/20 border border-green-500/50 text-green-400' 
                : 'bg-red-500/20 border border-red-500/50 text-red-400'
            }`}>
              {message}
            </div>
          )}

          <button
            onClick={handleContactClick}
            className="w-full px-6 py-3 bg-white/10 backdrop-blur-lg border border-white/30 text-white font-medium rounded-lg hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
          >
            Contact Us
          </button>
          
          <p className="text-sm text-gray-400 mt-4">
            Join 1,000+ streamers already using Casi Platform
          </p>
        </div>

      </div>
    </div>
  )
}
