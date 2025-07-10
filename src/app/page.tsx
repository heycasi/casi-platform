
'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LandingPage() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [waitlistCount, setWaitlistCount] = useState(172) // Starting number

  // Load actual waitlist count from Supabase
  useEffect(() => {
    loadWaitlistCount()
  }, [])

  // Live counter effect
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly increment the counter (simulates real signups)
      if (Math.random() < 0.3) { // 30% chance every 10 seconds
        setWaitlistCount(prev => prev + 1)
      }
    }, 10000) // Check every 10 seconds

    return () => clearInterval(interval)
  }, [])

  const loadWaitlistCount = async () => {
    try {
      const { count, error } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true })

      if (error) {
        console.error('Error loading count:', error)
        return
      }

      // Use actual count + starting number to make it look more impressive
      setWaitlistCount((count || 0) + 150)
    } catch (error) {
      console.error('Error loading waitlist count:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      // Insert into Supabase
      const { data, error } = await supabase
        .from('waitlist')
        .insert([
          {
            email: email.toLowerCase().trim(),
            source: 'landing_page',
            user_agent: navigator.userAgent
          }
        ])
        .select()

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          setError('This email is already on the waitlist!')
        } else {
          throw error
        }
        return
      }

      // Success!
      setIsSubmitted(true)
      setEmail('')
      
      // Increment counter when someone signs up
      setWaitlistCount(prev => prev + 1)
      
      // Track signup event (optional)
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'waitlist_signup', {
          event_category: 'engagement',
          event_label: 'email_signup'
        })
      }

    } catch (error) {
      console.error('Submission error:', error)
      setError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'Poppins, Arial, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* Background decoration */}
      <div style={{
        position: 'absolute',
        top: '20%',
        right: '10%',
        width: '200px',
        height: '200px',
        background: 'linear-gradient(45deg, #B8EE8A, #5EEAD4)',
        borderRadius: '50%',
        opacity: 0.1,
        filter: 'blur(40px)'
      }} />
      
      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: '10%',
        width: '300px',
        height: '300px',
        background: 'linear-gradient(45deg, #FF9F9F, #6932FF)',
        borderRadius: '50%',
        opacity: 0.1,
        filter: 'blur(60px)'
      }} />

      {/* Main content */}
      <div style={{
        maxWidth: '900px',
        textAlign: 'center',
        zIndex: 1
      }}>
        
        {/* Logo */}
        <div style={{ marginBottom: '3rem' }}>
          <img 
            src="/landing-logo.png" 
            alt="Casi Platform" 
            style={{ 
              width: '300px', 
              height: 'auto',
              maxWidth: '100%'
            }}
            onError={(e) => {
              // Fallback if image doesn't load
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              target.insertAdjacentHTML('afterend', `
                <div style="font-size: 3rem; font-weight: bold; color: white; margin-bottom: 2rem;">
                  🎮 Casi Platform
                </div>
              `)
            }}
          />
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: '3.5rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, #5EEAD4, #FF9F9F, #932FFE)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Get early access
        </h1>

        <h2 style={{
          fontSize: '1.5rem',
          marginBottom: '2rem',
          color: '#e0e0e0',
          fontWeight: '400'
        }}>
          See your stream like never before.
        </h2>

        {/* Description */}
        <p style={{
          fontSize: '1.1rem',
          lineHeight: '1.6',
          marginBottom: '3rem',
          color: '#b0b0b0',
          maxWidth: '600px',
          margin: '0 auto 3rem auto'
        }}>
          Hey there, I'm Casi, your stream's brainy sidekick! I'll keep an eye 
          on your viewers, chat vibes, and highlight what's working best. 
          Ready to get smarter with your stream?
        </p>

        {/* Email form */}
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '3rem',
            maxWidth: '500px',
            margin: '0 auto 3rem auto',
            flexWrap: 'wrap'
          }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={isSubmitting}
              style={{
                flex: 1,
                minWidth: '250px',
                padding: '1rem 1.5rem',
                borderRadius: '50px',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '1rem',
                outline: 'none',
                backdropFilter: 'blur(10px)'
              }}
            />
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '1rem 2rem',
                borderRadius: '50px',
                border: 'none',
                background: 'linear-gradient(135deg, #6932FF, #932FFE)',
                color: 'white',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
                transition: 'all 0.3s ease',
                minWidth: '150px'
              }}
            >
              {isSubmitting ? 'Joining...' : 'Join waitlist'}
            </button>
          </form>
        ) : (
          <div style={{
            padding: '2rem',
            background: 'linear-gradient(135deg, rgba(184, 238, 138, 0.2), rgba(94, 234, 212, 0.2))',
            borderRadius: '20px',
            marginBottom: '3rem',
            border: '2px solid rgba(184, 238, 138, 0.3)'
          }}>
            <h3 style={{ 
              fontSize: '1.5rem', 
              marginBottom: '0.5rem',
              color: '#B8EE8A'
            }}>
              🎉 You're in!
            </h3>
            <p style={{ 
              color: '#e0e0e0',
              margin: 0
            }}>
              Thanks for joining the waitlist! We'll notify you when Casi is ready to boost your stream.
            </p>
          </div>
        )}

        {error && (
          <div style={{
            color: '#FF9F9F',
            marginBottom: '2rem',
            fontSize: '0.9rem',
            padding: '1rem',
            background: 'rgba(255, 159, 159, 0.1)',
            borderRadius: '10px',
            border: '1px solid rgba(255, 159, 159, 0.3)'
          }}>
            {error}
          </div>
        )}

        {/* Stats */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2rem',
          marginBottom: '3rem',
          flexWrap: 'wrap'
        }}>
          <div>
            <div style={{
              fontSize: '4rem',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #5EEAD4, #FF9F9F, #932FFE)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: 1,
              transition: 'all 0.5s ease'
            }}>
              {waitlistCount}
            </div>
            <div style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              marginBottom: '0.5rem'
            }}>
              streamers
            </div>
            <div style={{
              color: '#b0b0b0',
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              justifyContent: 'center'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#4ade80',
                borderRadius: '50%',
                animation: 'pulse 2s infinite'
              }} />
              currently waiting
            </div>
          </div>
          
          {/* Casi Robot */}
          <img 
            src="/landing-robot.png" 
            alt="Casi Robot" 
            style={{ 
              width: '300px', 
              height: 'auto',
              maxWidth: '100%',
              animation: 'float 3s ease-in-out infinite'
            }}
            onError={(e) => {
              // Fallback if image doesn't load
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              target.insertAdjacentHTML('afterend', `
                <div style="font-size: 8rem; animation: float 3s ease-in-out infinite;">
                  🤖
                </div>
              `)
            }}
          />
        </div>

        {/* Contact */}
        <div style={{ marginTop: '2rem' }}>
          <p style={{ 
            color: '#b0b0b0', 
            marginBottom: '1rem',
            fontSize: '1.1rem'
          }}>
            Want more info?
          </p>
          <button 
            onClick={() => window.location.href = 'mailto:hello@heycasi.com'}
            style={{
              padding: '0.75rem 2rem',
              borderRadius: '50px',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              background: 'transparent',
              color: 'white',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent'
            }}
          >
            Contact us
          </button>
        </div>
      </div>

      {/* Floating animation styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @media (max-width: 768px) {
          h1 {
            font-size: 2.5rem !important;
          }
          
          form {
            flex-direction: column !important;
          }
          
          input, button {
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  )
}
