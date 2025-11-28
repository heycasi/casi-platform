'use client'
import { useState } from 'react'

interface AddTalentModalProps {
  onClose: () => void
  onAddTalent: (email: string) => Promise<{ success: boolean; message: string }>
}

export default function AddTalentModal({ onClose, onAddTalent }: AddTalentModalProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Validate email
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)

    try {
      const result = await onAddTalent(email)

      if (result.success) {
        setSuccess(result.message)
        setEmail('')
        // Auto-close after 2 seconds
        setTimeout(() => {
          onClose()
        }, 2000)
      } else {
        setError(result.message)
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          border: '1px solid rgba(105, 50, 255, 0.3)',
          borderRadius: '16px',
          maxWidth: '500px',
          width: '100%',
          padding: '2rem',
          boxShadow: '0 8px 32px rgba(105, 50, 255, 0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.5rem',
            }}
          >
            <h2
              style={{
                fontSize: '1.75rem',
                fontWeight: 900,
                background: 'linear-gradient(135deg, #6932FF 0%, #932FFE 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                margin: 0,
              }}
            >
              Add Talent
            </h2>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: 0,
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                e.currentTarget.style.color = 'white'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'
              }}
            >
              ×
            </button>
          </div>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem', margin: 0 }}>
            Invite a streamer to your organization by email
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'rgba(255, 255, 255, 0.9)',
              }}
            >
              Streamer Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="streamer@example.com"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'white',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.2s ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#6932FF'
                e.currentTarget.style.background = 'rgba(105, 50, 255, 0.1)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
              }}
              disabled={loading}
            />
            <p
              style={{
                fontSize: '0.75rem',
                color: 'rgba(255, 255, 255, 0.5)',
                marginTop: '0.5rem',
                marginBottom: 0,
              }}
            >
              The streamer must already have a Casi account
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                marginBottom: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem' }}>⚠️</span>
                <span style={{ color: '#EF4444', fontSize: '0.875rem', fontWeight: 600 }}>
                  {error}
                </span>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                marginBottom: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem' }}>✅</span>
                <span style={{ color: '#10B981', fontSize: '0.875rem', fontWeight: 600 }}>
                  {success}
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'transparent',
                color: 'rgba(255, 255, 255, 0.9)',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
                background: loading
                  ? 'rgba(105, 50, 255, 0.5)'
                  : 'linear-gradient(135deg, #6932FF 0%, #932FFE 100%)',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: loading ? 'none' : '0 4px 12px rgba(105, 50, 255, 0.4)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(105, 50, 255, 0.6)'
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(105, 50, 255, 0.4)'
                }
              }}
              disabled={loading}
            >
              {loading && (
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTopColor: 'white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}
                />
              )}
              <span>{loading ? 'Adding...' : 'Add Talent'}</span>
            </button>
          </div>
        </form>

        <style jsx>{`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    </div>
  )
}
