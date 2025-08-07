'use client'

import { useEffect } from 'react'

export default function OverviewPage() {
  useEffect(() => {
    // Redirect to the static HTML file
    window.location.href = '/overview.html'
  }, [])

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #B785FF 0%, #5EEAD4 100%)',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '24px', marginBottom: '10px' }}>🤖</div>
        <div>Redirecting to Casi overview...</div>
      </div>
    </div>
  )
}