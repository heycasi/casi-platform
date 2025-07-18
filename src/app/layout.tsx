import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Casi Platform - Real-time Streaming Analytics',
  description: 'AI-powered chat analysis for streamers',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body style={{ fontFamily: 'Poppins, Arial, sans-serif' }}>{children}</body>
    </html>
  )
}
