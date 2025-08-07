// PDF generation service for stream reports

import puppeteer from 'puppeteer'
import { StreamReport } from '../types/analytics'
import path from 'path'
import fs from 'fs'

export class PDFService {
  // Helper function to convert image to base64 data URL
  private static getImageAsBase64(imagePath: string): string {
    try {
      const fullPath = path.join(process.cwd(), 'public', imagePath)
      const imageBuffer = fs.readFileSync(fullPath)
      const base64Image = imageBuffer.toString('base64')
      const mimeType = imagePath.endsWith('.png') ? 'image/png' : 'image/jpeg'
      return `data:${mimeType};base64,${base64Image}`
    } catch (error) {
      console.error(`Failed to load image ${imagePath}:`, error)
      return ''
    }
  }

  static async generateStreamReportPDF(report: StreamReport): Promise<Buffer> {
    let browser = null
    
    try {
      console.log('Launching Puppeteer browser...')
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      })
      console.log('Browser launched successfully')
      
      const page = await browser.newPage()
      
      // Set viewport for consistent rendering
      await page.setViewport({ width: 1200, height: 800 })
      
      // Load images as base64
      const casiLogo = this.getImageAsBase64('landing-logo.png')
      const robotImage = this.getImageAsBase64('landing-robot.png')
      
      // Generate HTML content
      const htmlContent = generatePDFHTML(report, casiLogo, robotImage)
      
      // Set content and wait for load
      await page.setContent(htmlContent, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      })
      
      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '0.5in',
          bottom: '0.5in',
          left: '0.5in',
          right: '0.5in'
        }
      })
      
      return pdfBuffer
    } catch (error) {
      console.error('PDF generation error:', error)
      throw new Error('Failed to generate PDF report')
    } finally {
      if (browser) {
        await browser.close()
      }
    }
  }
}

function generatePDFHTML(report: StreamReport, casiLogo: string, robotImage: string): string {
  const { session, analytics, highlights, recommendations } = report
  
  // Helper functions  
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const getSentimentEmoji = (score: number) => {
    if (score > 0.5) return '😊'
    if (score < -0.5) return '😢'
    return '😐'
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Stream Report - ${session.channel_name}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Poppins', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background: white;
        }
        
        .header {
          background: linear-gradient(135deg, #6932FF 0%, #932FFE 100%);
          color: white;
          padding: 40px;
          text-align: center;
          margin-bottom: 30px;
          position: relative;
        }
        
        .header-logos {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin: 0 auto 20px;
        }
        
        .casi-logo {
          height: 40px;
          width: auto;
          filter: brightness(0) invert(1);
        }
        
        .robot-logo {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          padding: 4px;
        }
        
        .header h1 {
          font-size: 36px;
          font-weight: 700;
          margin-bottom: 10px;
        }
        
        .header .subtitle {
          font-size: 18px;
          opacity: 0.9;
          margin-bottom: 5px;
        }
        
        .content {
          padding: 0 40px;
          max-width: 1000px;
          margin: 0 auto;
        }
        
        .section {
          margin-bottom: 40px;
          page-break-inside: avoid;
        }
        
        .section h2 {
          color: #6932FF;
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 3px solid #6932FF;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .metric {
          background: #f8f9fb;
          padding: 25px;
          border-radius: 12px;
          text-align: center;
          border: 2px solid #e5e7eb;
        }
        
        .metric-value {
          font-size: 36px;
          font-weight: 800;
          color: #6932FF;
          display: block;
          margin-bottom: 8px;
        }
        
        .accent-teal { color: #5EEAD4; }
        .accent-pink { color: #FF9F9F; }
        .accent-lime { color: #B8EE8A; }
        .accent-purple { color: #932FFE; }
        
        .metric-label {
          font-size: 14px;
          color: #6b7280;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
        
        .highlight-item {
          background: #eff6ff;
          border-left: 4px solid #3b82f6;
          padding: 20px;
          margin: 15px 0;
          border-radius: 0 8px 8px 0;
        }
        
        .question-item {
          background: #fef7f7;
          border-left: 4px solid #ef4444;
          padding: 16px;
          margin: 12px 0;
          border-radius: 0 8px 8px 0;
        }
        
        .question-meta {
          font-size: 12px;
          color: #6b7280;
          margin-top: 8px;
          display: flex;
          gap: 12px;
          align-items: center;
        }
        
        .language-tag {
          background: #6932FF;
          color: white;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
        }
        
        .engagement-badge {
          background: #f59e0b;
          color: white;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
        }
        
        .recommendation {
          background: #f0fdf4;
          border-left: 4px solid #22c55e;
          padding: 16px;
          margin: 12px 0;
          border-radius: 0 8px 8px 0;
        }
        
        .footer {
          background: #f8f9fb;
          padding: 30px;
          text-align: center;
          margin-top: 40px;
          border-top: 1px solid #e5e7eb;
        }
        
        .footer-logos {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin: 0 auto 15px;
        }
        
        .footer-logo {
          height: 24px;
          width: auto;
        }
        
        .footer-robot {
          width: 24px;
          height: 24px;
          border-radius: 50%;
        }
        
        .footer p {
          color: #6b7280;
          font-size: 14px;
          margin: 5px 0;
        }
        
        .two-column {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin: 20px 0;
        }
        
        @media print {
          .section {
            page-break-inside: avoid;
          }
          
          .header {
            page-break-after: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="header-logos">
          ${casiLogo ? `<img src="${casiLogo}" class="casi-logo" alt="Casi" />` : `<div style="color: white; font-size: 24px; font-weight: 800; font-family: 'Poppins', Arial, sans-serif;">Casi</div>`}
          ${robotImage ? `<img src="${robotImage}" class="robot-logo" alt="Casi Robot" />` : `<div class="robot-logo" style="background: #B8EE8A; display: flex; align-items: center; justify-content: center; font-size: 20px;">🤖</div>`}
        </div>
        <h1>🎮 Stream Report</h1>
        <div class="subtitle"><strong>@${session.channel_name}</strong></div>
        <div class="subtitle">${new Date(session.session_start).toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</div>
        <div class="subtitle">${formatDuration(session.duration_minutes || 0)} streamed</div>
      </div>
      
      <div class="content">
        <div class="section">
          <h2>📊 Stream Overview</h2>
          <div class="metrics-grid">
            <div class="metric">
              <span class="metric-value accent-teal">${analytics.total_messages.toLocaleString()}</span>
              <div class="metric-label">Messages</div>
            </div>
            <div class="metric">
              <span class="metric-value accent-pink">${analytics.questions_count}</span>
              <div class="metric-label">Questions</div>
            </div>
            <div class="metric">
              <span class="metric-value accent-teal">${session.peak_viewer_count}</span>
              <div class="metric-label">Peak Viewers</div>
            </div>
            <div class="metric">
              <span class="metric-value">${getSentimentEmoji(analytics.avg_sentiment_score)}</span>
              <div class="metric-label">Mood</div>
            </div>
            <div class="metric">
              <span class="metric-value accent-lime">${analytics.positive_messages}</span>
              <div class="metric-label">Positive</div>
            </div>
            <div class="metric">
              <span class="metric-value accent-purple">${Object.keys(analytics.languages_detected).length}</span>
              <div class="metric-label">Languages</div>
            </div>
          </div>
        </div>

        ${highlights.bestMoments.length > 0 ? `
        <div class="section">
          <h2>🔥 Best Moments</h2>
          ${highlights.bestMoments.map(moment => 
            `<div class="highlight-item">
              <strong>${moment.description}</strong><br>
              <small style="color: #6b7280;">
                ${new Date(moment.timestamp).toLocaleTimeString()} • 
                Excitement: ${Math.round(moment.sentiment_score * 100)}%
              </small>
            </div>`
          ).join('')}
        </div>
        ` : ''}

        <div class="two-column">
          <div>
            ${highlights.topQuestions.length > 0 ? `
            <div class="section">
              <h2>❓ Top Questions</h2>
              ${highlights.topQuestions.slice(0, 3).map(q => 
                `<div class="question-item">
                  <div><strong>@${q.username}:</strong> ${q.message}</div>
                  <div class="question-meta">
                    <span class="language-tag">${q.language || 'english'}</span>
                    ${q.engagement_level === 'high' ? '<span class="engagement-badge">🔥 High</span>' : ''}
                    <span>${new Date(q.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>`
              ).join('')}
            </div>
            ` : ''}
          </div>
          
          <div>
            <div class="section">
              <h2>🌍 Global Reach</h2>
              <div class="highlight-item">
                <strong>Languages detected:</strong> 
                ${Object.entries(highlights.languageBreakdown)
                  .sort(([,a], [,b]) => b.count - a.count)
                  .map(([lang, data]) => `${lang} (${data.percentage}%)`)
                  .join(', ')}
              </div>
            </div>
          </div>
        </div>

        ${analytics.motivational_insights && analytics.motivational_insights.length > 0 ? `
        <div class="section">
          <h2>🤖 AI Insights</h2>
          ${analytics.motivational_insights.map((insight: string) => 
            `<div class="highlight-item">${insight}</div>`
          ).join('')}
        </div>
        ` : ''}

        ${Object.keys(recommendations.streamOptimization).length > 0 || 
          Object.keys(recommendations.contentSuggestions).length > 0 || 
          Object.keys(recommendations.engagementTips).length > 0 ? `
        <div class="section">
          <h2>🎯 Recommendations</h2>
          ${recommendations.streamOptimization.map((rec: string) => 
            `<div class="recommendation"><strong>⚡ Stream Optimization:</strong> ${rec}</div>`
          ).join('')}
          ${recommendations.contentSuggestions.map((rec: string) => 
            `<div class="recommendation"><strong>🎨 Content:</strong> ${rec}</div>`
          ).join('')}
          ${recommendations.engagementTips.map((rec: string) => 
            `<div class="recommendation"><strong>💬 Engagement:</strong> ${rec}</div>`
          ).join('')}
        </div>
        ` : ''}
      </div>

      <div class="footer">
        <div class="footer-logos">
          ${casiLogo ? `<img src="${casiLogo}" class="footer-logo" alt="Casi" style="filter: none;" />` : `<div style="color: #6932FF; font-size: 16px; font-weight: 800; font-family: 'Poppins', Arial, sans-serif;">Casi</div>`}
          ${robotImage ? `<img src="${robotImage}" class="footer-robot" alt="Casi Robot" />` : `<div style="width: 24px; height: 24px; background: #B8EE8A; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px;">🤖</div>`}
        </div>
        <p><strong style="color: #6932FF;">Your stream's brainy co-pilot</strong></p>
        <p>Report generated in ${report.metadata.processing_time_ms}ms • v${report.metadata.report_version}</p>
        <p style="margin-top: 15px; font-size: 12px; color: #5EEAD4;">
          Visit <strong>heycasi.com</strong> to analyze your next stream
        </p>
      </div>
    </body>
    </html>
  `
}