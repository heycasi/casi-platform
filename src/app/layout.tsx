import type { Metadata } from 'next'
import './globals.css'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export const metadata: Metadata = {
  title: 'Casi Platform - Real-time Streaming Analytics',
  description: 'AI-powered chat analysis for streamers',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        style={{
          minHeight: '100vh',
          background: '#0B0D14',
          fontFamily: 'Poppins, Arial, sans-serif',
          color: 'white',
          margin: 0,
          padding: 0,
        }}
      >
        <main>{children}</main>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
