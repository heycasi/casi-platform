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
      <body>{children}</body>
    </html>
  )
}
