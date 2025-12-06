'use client'

import { useEffect, useRef } from 'react'

interface SentimentChartProps {
  isAgencyOwnerViewingTalent?: boolean
}

export default function SentimentChart({
  isAgencyOwnerViewingTalent = false,
}: SentimentChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth * 2
    canvas.height = canvas.offsetHeight * 2
    ctx.scale(2, 2)

    const width = canvas.offsetWidth
    const height = canvas.offsetHeight

    // DEMO DATA: Create "toxic dip" for RiskyBrand narrative
    // Normal: [90, 85, 88, 92, 90, 87, 89, 91, 88, 90]
    // Demo: Deep red dip in the middle
    const demoData = [90, 90, 88, 85, 30, 28, 32, 85, 90, 92, 90, 88]

    const dataPoints = demoData.length
    const padding = 40
    const graphWidth = width - padding * 2
    const graphHeight = height - padding * 2

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
    ctx.lineWidth = 1
    for (let i = 0; i <= 5; i++) {
      const y = padding + (graphHeight / 5) * i
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()
    }

    // Draw Y-axis labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
    ctx.font = '11px monospace'
    ctx.textAlign = 'right'
    for (let i = 0; i <= 5; i++) {
      const value = 100 - i * 20
      const y = padding + (graphHeight / 5) * i + 4
      ctx.fillText(`${value}%`, padding - 10, y)
    }

    // Draw line graph
    ctx.beginPath()
    ctx.strokeStyle = '#8B5CF6'
    ctx.lineWidth = 3
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'

    demoData.forEach((value, index) => {
      const x = padding + (graphWidth / (dataPoints - 1)) * index
      const y = padding + graphHeight - (value / 100) * graphHeight

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()

    // Fill area under the curve with gradient
    const gradient = ctx.createLinearGradient(0, padding, 0, height - padding)
    gradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)')
    gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.1)')
    gradient.addColorStop(1, 'rgba(139, 92, 246, 0.0)')

    ctx.lineTo(width - padding, height - padding)
    ctx.lineTo(padding, height - padding)
    ctx.closePath()
    ctx.fillStyle = gradient
    ctx.fill()

    // Highlight the "toxic dip" area (indices 4-6)
    const toxicStartIndex = 4
    const toxicEndIndex = 6
    const toxicStartX = padding + (graphWidth / (dataPoints - 1)) * toxicStartIndex
    const toxicEndX = padding + (graphWidth / (dataPoints - 1)) * toxicEndIndex

    // Red warning overlay
    ctx.fillStyle = 'rgba(239, 68, 68, 0.1)'
    ctx.fillRect(toxicStartX - 10, padding, toxicEndX - toxicStartX + 20, graphHeight)

    // Draw data points
    demoData.forEach((value, index) => {
      const x = padding + (graphWidth / (dataPoints - 1)) * index
      const y = padding + graphHeight - (value / 100) * graphHeight

      // Highlight toxic dip points in red
      const isToxic = index >= toxicStartIndex && index <= toxicEndIndex

      ctx.beginPath()
      ctx.arc(x, y, isToxic ? 6 : 4, 0, Math.PI * 2)
      ctx.fillStyle = isToxic ? '#EF4444' : '#8B5CF6'
      ctx.fill()
      ctx.strokeStyle = '#1a1a1a'
      ctx.lineWidth = 2
      ctx.stroke()
    })

    // Add annotation for the toxic dip
    const toxicMidX = (toxicStartX + toxicEndX) / 2
    const toxicY = padding + graphHeight - (30 / 100) * graphHeight

    ctx.fillStyle = '#EF4444'
    ctx.font = 'bold 12px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('⚠️ TOXIC SPIKE', toxicMidX, toxicY - 15)

    ctx.font = '10px sans-serif'
    ctx.fillStyle = 'rgba(239, 68, 68, 0.8)'
    ctx.fillText('Chat went negative', toxicMidX, toxicY - 2)
  }, [])

  return (
    <div className="bg-white/5 rounded-2xl p-6 border border-white/10 h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-purple-400">📊 Sentiment Timeline</h3>
          <p className="text-xs text-gray-500 mt-1">Real-time chat mood analysis</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-xs text-gray-400">Positive</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-xs text-gray-400">Negative</span>
          </div>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: 'calc(100% - 60px)' }}
        className="rounded-lg"
      />
    </div>
  )
}
