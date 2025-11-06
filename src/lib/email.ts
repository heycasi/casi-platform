// Email service for sending stream reports

import { Resend } from 'resend'
import { StreamReport } from '../types/analytics'
import fs from 'fs'
import path from 'path'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

// Helper function to convert image to base64 data URL for email
function getImageAsBase64(imagePath: string): string {
  try {
    const fullPath = path.join(process.cwd(), 'public', imagePath)
    const imageBuffer = fs.readFileSync(fullPath)
    const base64Image = imageBuffer.toString('base64')
    const mimeType = imagePath.endsWith('.png') ? 'image/png' : 'image/jpeg'
    return `data:${mimeType};base64,${base64Image}`
  } catch (error) {
    console.error(`Failed to load email image ${imagePath}:`, error)
    return ''
  }
}

export class EmailService {
  static async sendStreamReport(email: string, report: StreamReport): Promise<boolean> {
    try {
      console.log('📧 Generating comprehensive HTML stream report...')

      // Check if Resend is available
      if (!resend) {
        console.error('❌ RESEND_API_KEY not configured, cannot send email')
        return false
      }

      // Validate inputs
      if (!report || !report.session || !report.analytics) {
        console.error('❌ Invalid report structure - missing required data')
        console.error('Report structure:', {
          hasReport: !!report,
          hasSession: !!report?.session,
          hasAnalytics: !!report?.analytics,
        })
        return false
      }

      if (!email || !email.includes('@')) {
        console.error('❌ Invalid email address:', email)
        return false
      }

      console.log('✅ Validation passed, generating HTML...')

      // Generate comprehensive HTML email
      const emailHTML = generateReportHTML(report)

      console.log(`📤 Sending report to ${email} for channel @${report.session.channel_name}`)

      const { data, error } = await resend.emails.send({
        from: 'Casi <casi@heycasi.com>',
        to: [email],
        subject: `🎮 Your Stream Report - ${report.session.channel_name}`,
        html: emailHTML,
      })

      console.log('Email send result:', {
        success: !!data,
        emailId: data?.id,
        hasError: !!error,
      })

      if (error) {
        console.error('❌ Resend API error:', error)
        console.error('Error details:', JSON.stringify(error, null, 2))
        console.error('Error type:', error.name)
        console.error('Error message:', error.message)
        return false
      }

      console.log('✅ Stream report email sent successfully!')
      console.log('   Email ID:', data?.id)
      console.log('   Recipient:', email)
      console.log('   Channel:', report.session.channel_name)
      return true
    } catch (error) {
      console.error('❌ Email service exception:', error)
      console.error('Exception details:', error instanceof Error ? error.message : 'Unknown error')
      console.error('Stack trace:', error instanceof Error ? error.stack : 'N/A')
      return false
    }
  }

  static async sendTestEmail(email: string): Promise<boolean> {
    try {
      const { data, error } = await resend.emails.send({
        from: 'Casi <casi@heycasi.com>',
        to: [email],
        subject: '🧪 Test Email from Casi',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
          </head>
          <body style="font-family: 'Poppins', Arial, sans-serif; margin: 0; padding: 20px; background: linear-gradient(135deg, rgba(105, 50, 255, 0.15), rgba(147, 47, 254, 0.1), rgba(30, 58, 138, 0.15)); background-color: #1a1a2e; position: relative;">
            <!-- Background robot mascot -->
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 100%; height: 100%; pointer-events: none; z-index: 0; display: flex; align-items: center; justify-content: center;">
              <img src="https://heycasi.com/landing-robot.png" alt="" style="width: 850px; height: auto; max-width: 100%; object-fit: contain; opacity: 0.08; filter: brightness(0.7);" />
            </div>

            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); position: relative; z-index: 1;">

              <!-- Header -->
              <div style="background: linear-gradient(135deg, #6932FF 0%, #932FFE 100%); padding: 40px 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 32px;">🧪 Test Email</h1>
              </div>

              <!-- Content -->
              <div style="padding: 40px 30px;">
                <p style="font-size: 18px; color: #333; margin-bottom: 20px;">This is a test email from your Casi platform to verify email delivery is working!</p>
                <p style="font-size: 16px; color: #666; margin-bottom: 20px;">If you received this, your email configuration is set up correctly.</p>

                <div style="background: rgba(105, 50, 255, 0.05); border-left: 4px solid #6932FF; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                  <p style="margin: 0; color: #333; font-weight: 600;">✅ Email delivery confirmed</p>
                  <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">All systems are working correctly!</p>
                </div>

                <p style="color: #666; font-size: 14px; margin-top: 30px;">Questions? Just reply to this email - we're here to help!</p>
              </div>

              <!-- Footer -->
              <div style="background: #f8f9fb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; color: #6932FF; font-weight: 700;">Casi</p>
                <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">Your stream's brainy co-pilot</p>
              </div>
            </div>
          </body>
          </html>
        `,
      })

      if (error) {
        console.error('Test email error:', error)
        console.error('Full error details:', JSON.stringify(error, null, 2))
        return false
      }

      console.log('Test email sent:', data?.id)
      return true
    } catch (error) {
      console.error('Test email service error:', error)
      return false
    }
  }

  static async sendSubscriptionConfirmation(
    email: string,
    planName: string,
    billingInterval: string,
    amount: number
  ): Promise<boolean> {
    try {
      if (!resend) {
        console.log('⚠️ RESEND_API_KEY not configured, skipping subscription email')
        return false
      }

      const { data, error } = await resend.emails.send({
        from: 'Casi <casi@heycasi.com>',
        to: [email],
        subject: `🎉 Welcome to Casi ${planName}!`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
          </head>
          <body style="font-family: 'Poppins', Arial, sans-serif; margin: 0; padding: 20px; background: linear-gradient(135deg, rgba(105, 50, 255, 0.15), rgba(147, 47, 254, 0.1), rgba(30, 58, 138, 0.15)); background-color: #1a1a2e;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

              <!-- Header -->
              <div style="background: linear-gradient(135deg, #6932FF 0%, #932FFE 100%); padding: 40px 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 32px;">🎉 Welcome to Casi!</h1>
              </div>

              <!-- Content -->
              <div style="padding: 40px 30px;">
                <p style="font-size: 18px; color: #333; margin-bottom: 20px;">Thanks for subscribing to <strong style="color: #6932FF;">Casi ${planName}</strong>!</p>

                <div style="background: #f8f9fb; border-left: 4px solid #6932FF; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                  <p style="margin: 0; color: #666;"><strong>Plan:</strong> ${planName}</p>
                  <p style="margin: 10px 0 0 0; color: #666;"><strong>Billing:</strong> £${amount}/${billingInterval}</p>
                </div>

                <h2 style="color: #6932FF; font-size: 20px; margin-top: 30px;">🚀 Next Steps:</h2>
                <ol style="color: #666; line-height: 1.8;">
                  <li>Connect your Twitch account</li>
                  <li>Set up your dashboard preferences</li>
                  <li>Start tracking your stream chat</li>
                </ol>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://www.heycasi.com/dashboard" style="display: inline-block; background: linear-gradient(135deg, #6932FF, #932FFE); color: white; padding: 15px 30px; border-radius: 25px; text-decoration: none; font-weight: 600;">
                    Go to Dashboard
                  </a>
                </div>

                <p style="color: #666; font-size: 14px; margin-top: 30px;">If you have any questions, just reply to this email. We're here to help!</p>
              </div>

              <!-- Footer -->
              <div style="background: #f8f9fb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; color: #6932FF; font-weight: 700;">Casi</p>
                <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">Your stream's brainy co-pilot</p>
              </div>
            </div>
          </body>
          </html>
        `,
      })

      if (error) {
        console.error('Subscription email error:', error)
        return false
      }

      console.log('✅ Subscription confirmation email sent:', data?.id)
      return true
    } catch (error) {
      console.error('Subscription email service error:', error)
      return false
    }
  }
}

function generateReportHTML(report: StreamReport): string {
  const { session, analytics, highlights, recommendations, events } = report

  // Helper function to format duration
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  // Helper functions for event formatting
  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'subscription':
      case 'resub':
        return '⭐'
      case 'gift_sub':
        return '🎁'
      case 'follow':
        return '❤️'
      case 'bits':
        return '💎'
      case 'raid':
        return '⚔️'
      default:
        return '📢'
    }
  }

  const getEventTitle = (event: any) => {
    switch (event.event_type) {
      case 'subscription':
        return `${event.user_display_name} subscribed!`
      case 'resub':
        return `${event.user_display_name} resubscribed!`
      case 'gift_sub':
        const count = event.event_data?.total || 1
        return `${event.user_display_name} gifted ${count} ${count > 1 ? 'subs' : 'sub'}!`
      case 'follow':
        return `${event.user_display_name} followed!`
      case 'bits':
        return `${event.user_display_name} cheered ${event.event_data?.bits || 0} bits!`
      case 'raid':
        return `${event.user_display_name} raided with ${event.event_data?.viewers || 0} viewers!`
      default:
        return `${event.user_display_name} - ${event.event_type}`
    }
  }

  // Use absolute HTTPS URLs for production
  const siteUrl = 'https://heycasi.com'

  // Construct full image URLs
  const casiLogoUrl = `${siteUrl}/landing-logo.png`
  const robotImageUrl = `${siteUrl}/landing-robot.png`

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Stream Report - ${session.channel_name}</title>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    </head>
    <body style="font-family: 'Poppins', Arial, sans-serif; margin: 0; padding: 20px; background: linear-gradient(135deg, rgba(105, 50, 255, 0.15), rgba(147, 47, 254, 0.1), rgba(30, 58, 138, 0.15)); background-color: #1a1a2e; color: #333; line-height: 1.6;">
      <div style="max-width: 800px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

        <!-- Header with Casi Branding -->
        <div style="background: linear-gradient(135deg, #6932FF 0%, #932FFE 100%); background-color: #6932FF; padding: 40px 30px; text-align: center; color: #FFFFFF;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${casiLogoUrl}" alt="Casi" style="max-width: 200px; height: auto; filter: brightness(0) invert(1); vertical-align: middle;" onerror="this.alt='Casi'" />
            <img src="${robotImageUrl}" alt="🤖" style="width: 48px; height: 48px; border-radius: 50%; background: rgba(255,255,255,0.2); padding: 4px; margin-left: 12px; vertical-align: middle;" onerror="this.alt='🤖'" />
          </div>
          <h1 style="margin: 0 0 10px 0; font-size: 28px; font-weight: 700; font-family: 'Poppins', Arial, sans-serif; color: #FFFFFF !important; text-shadow: none; -webkit-text-fill-color: #FFFFFF;">🎮 Your Stream Report</h1>
          <p style="margin: 0; font-size: 18px; font-weight: 600; color: #FFFFFF !important; text-shadow: none; -webkit-text-fill-color: #FFFFFF;"><strong style="color: #FFFFFF !important; -webkit-text-fill-color: #FFFFFF;">@${session.channel_name}</strong></p>
          <p style="margin: 8px 0 0 0; font-size: 14px; color: #FFFFFF !important; text-shadow: none; -webkit-text-fill-color: #FFFFFF;">${new Date(
            session.session_start
          ).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}</p>
          <p style="margin: 5px 0 0 0; font-size: 14px; color: #FFFFFF !important; text-shadow: none; -webkit-text-fill-color: #FFFFFF;">${formatDuration(session.duration_minutes || 0)} streamed</p>
        </div>

        <!-- Main Content -->
        <div style="padding: 40px 30px;">

          <!-- Interactive Report Button -->
          <div style="background: rgba(105, 50, 255, 0.05); border: 3px dashed #6932FF; border-radius: 16px; padding: 30px; text-align: center; margin-bottom: 40px;">
            <h2 style="color: #6932FF; font-size: 24px; font-weight: 700; margin-bottom: 15px;">🎮 View Your Interactive Report!</h2>
            <p style="color: #374151; margin-bottom: 20px;">Experience your stream stats with animations, achievements, and social sharing!</p>
            <a href="${siteUrl}/report/${session.id}" style="display: inline-block; background: linear-gradient(135deg, #6932FF 0%, #932FFE 100%); color: white; padding: 18px 40px; border-radius: 30px; text-decoration: none; font-weight: 700; font-size: 18px; box-shadow: 0 4px 15px rgba(105, 50, 255, 0.4);">
              ✨ Open Interactive Report
            </a>
          </div>

          <!-- Key Metrics Section -->
          <div style="margin-bottom: 40px;">
            <h2 style="color: #6932FF !important; font-size: 24px; font-weight: 700; margin-bottom: 20px; font-family: 'Poppins', Arial, sans-serif; border-bottom: 3px solid #6932FF; padding-bottom: 10px;">📊 Stream Overview</h2>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
              <div style="background: #f8f9fb; padding: 25px; border-radius: 12px; text-align: center; border: 2px solid #e5e7eb;">
                <div style="font-size: 36px; font-weight: 800; color: #5EEAD4; margin-bottom: 8px;">${analytics.total_messages.toLocaleString()}</div>
                <div style="font-size: 12px; color: #6b7280 !important; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Messages</div>
              </div>
              
              <div style="background: #f8f9fb; padding: 25px; border-radius: 12px; text-align: center; border: 2px solid #e5e7eb;">
                <div style="font-size: 36px; font-weight: 800; color: #FF9F9F; margin-bottom: 8px;">${analytics.questions_count}</div>
                <div style="font-size: 12px; color: #6b7280 !important; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Questions</div>
              </div>
              
              <div style="background: #f8f9fb; padding: 25px; border-radius: 12px; text-align: center; border: 2px solid #e5e7eb;">
                <div style="font-size: 36px; font-weight: 800; color: #5EEAD4; margin-bottom: 8px;">${session.peak_viewer_count || 0}</div>
                <div style="font-size: 12px; color: #6b7280 !important; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Peak Viewers</div>
              </div>
              
              <div style="background: #f8f9fb; padding: 25px; border-radius: 12px; text-align: center; border: 2px solid #e5e7eb;">
                <div style="font-size: 36px; font-weight: 800; color: #B8EE8A; margin-bottom: 8px;">${analytics.positive_messages}</div>
                <div style="font-size: 12px; color: #6b7280 !important; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Positive</div>
              </div>
              
              <div style="background: #f8f9fb; padding: 25px; border-radius: 12px; text-align: center; border: 2px solid #e5e7eb;">
                <div style="font-size: 36px; font-weight: 800; color: #932FFE; margin-bottom: 8px;">${Object.keys(analytics.languages_detected).length}</div>
                <div style="font-size: 12px; color: #6b7280 !important; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Languages</div>
              </div>
              
              <div style="background: #f8f9fb; padding: 25px; border-radius: 12px; text-align: center; border: 2px solid #e5e7eb;">
                <div style="font-size: 36px; font-weight: 800; color: #6932FF; margin-bottom: 8px;">${Math.round((analytics.positive_messages / analytics.total_messages) * 100)}%</div>
                <div style="font-size: 12px; color: #6b7280 !important; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Positive Rate</div>
              </div>
            </div>
          </div>

          <!-- Stream Highlights (Activity Feed) -->
          ${
            events && events.length > 0
              ? `
          <div style="margin-bottom: 40px;">
            <h2 style="color: #6932FF !important; font-size: 24px; font-weight: 700; margin-bottom: 20px; font-family: 'Poppins', Arial, sans-serif; border-bottom: 3px solid #6932FF; padding-bottom: 10px;">⚡ Stream Highlights</h2>
            ${events
              .slice(0, 5)
              .map((event) => {
                const icon = getEventIcon(event.event_type)
                const title = getEventTitle(event)
                return `
                <div style="background: #f8f9fb; border-left: 4px solid #6932FF; padding: 16px 20px; margin: 12px 0; border-radius: 0 12px 12px 0; display: flex; align-items: center; gap: 15px;">
                  <span style="font-size: 32px;">${icon}</span>
                  <div style="flex: 1;">
                    <div style="font-weight: 600; color: #1f2937; font-size: 15px;">${title}</div>
                    <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">${new Date(event.created_at).toLocaleTimeString()}</div>
                  </div>
                </div>
              `
              })
              .join('')}
          </div>
          `
              : ''
          }

          <!-- Best Moments Section -->
          ${
            highlights.bestMoments && highlights.bestMoments.length > 0
              ? `
          <div style="margin-bottom: 40px;">
            <h2 style="color: #6932FF !important; font-size: 24px; font-weight: 700; margin-bottom: 20px; font-family: 'Poppins', Arial, sans-serif; border-bottom: 3px solid #6932FF; padding-bottom: 10px;">🔥 Best Moments</h2>
            ${highlights.bestMoments
              .map(
                (moment, index) =>
                  `<div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 15px 0; border-radius: 0 8px 8px 0;">
                <strong style="color: #1f2937; font-size: 16px;">${moment.description}</strong><br>
                <small style="color: #6b7280; font-size: 14px; margin-top: 8px; display: block;">
                  ${new Date(moment.timestamp).toLocaleTimeString()} • 
                  Excitement: ${Math.round(moment.sentiment_score * 100)}%
                </small>
              </div>`
              )
              .join('')}
          </div>
          `
              : ''
          }

          <!-- Two Column Layout for Questions and Languages -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 40px;">
            
            <!-- Top Questions -->
            ${
              highlights.topQuestions && highlights.topQuestions.length > 0
                ? `
            <div>
              <h2 style="color: #6932FF !important; font-size: 20px; font-weight: 700; margin-bottom: 20px; font-family: 'Poppins', Arial, sans-serif;">❓ Top Questions</h2>
              ${highlights.topQuestions
                .slice(0, 5)
                .map(
                  (q) =>
                    `<div style="background: #fef7f7; border-left: 4px solid #ef4444; padding: 16px; margin: 12px 0; border-radius: 0 8px 8px 0;">
                  <div style="font-weight: 600; color: #1f2937; margin-bottom: 8px;"><strong>@${q.username}:</strong> ${q.message}</div>
                  <div style="font-size: 12px; color: #6b7280; display: flex; gap: 12px; align-items: center;">
                    <span style="background: #6932FF; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">${q.language || 'english'}</span>
                    ${q.engagement_level === 'high' ? '<span style="background: #f59e0b; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">🔥 High</span>' : ''}
                    <span>${new Date(q.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>`
                )
                .join('')}
            </div>
            `
                : ''
            }
            
            <!-- Global Reach -->
            <div>
              <h2 style="color: #6932FF !important; font-size: 20px; font-weight: 700; margin-bottom: 20px; font-family: 'Poppins', Arial, sans-serif;">🌍 Global Reach</h2>
              <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 0 8px 8px 0;">
                <strong style="color: #1f2937; display: block; margin-bottom: 10px;">Languages detected:</strong> 
                ${Object.entries(highlights.languageBreakdown || {})
                  .sort(([, a], [, b]) => b.count - a.count)
                  .map(
                    ([lang, data]) =>
                      `<span style="display: inline-block; background: #5EEAD4; color: #1f2937; padding: 4px 8px; border-radius: 4px; margin: 2px; font-size: 12px; font-weight: 600;">${lang} (${data.percentage}%)</span>`
                  )
                  .join('')}
              </div>
              
              <!-- Most Engaged Viewers -->
              ${
                highlights.mostEngagedViewers && highlights.mostEngagedViewers.length > 0
                  ? `
              <div style="margin-top: 20px;">
                <h3 style="color: #6932FF !important; font-size: 16px; font-weight: 600; margin-bottom: 15px;">💬 Most Active Chatters</h3>
                ${highlights.mostEngagedViewers
                  .slice(0, 3)
                  .map(
                    (viewer, index) =>
                      `<div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; margin: 8px 0; border-radius: 0 6px 6px 0;">
                    <strong style="color: #1f2937;">@${viewer.username}</strong>
                    <span style="color: #6b7280; font-size: 12px; margin-left: 10px;">${viewer.message_count} messages • ${Math.round(viewer.avg_sentiment * 100)}% positive</span>
                  </div>`
                  )
                  .join('')}
              </div>
              `
                  : ''
              }
            </div>
          </div>

          <!-- AI Insights Section -->
          ${
            analytics.motivational_insights && analytics.motivational_insights.length > 0
              ? `
          <div style="margin-bottom: 40px;">
            <h2 style="color: #6932FF !important; font-size: 24px; font-weight: 700; margin-bottom: 20px; font-family: 'Poppins', Arial, sans-serif; border-bottom: 3px solid #6932FF; padding-bottom: 10px;">🤖 AI Insights</h2>
            ${analytics.motivational_insights
              .map(
                (insight) =>
                  `<div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 15px 0; border-radius: 0 8px 8px 0;">
                <span style="color: #1f2937; font-size: 16px;">${insight}</span>
              </div>`
              )
              .join('')}
          </div>
          `
              : ''
          }

          <!-- Recommendations Section -->
          ${
            recommendations.streamOptimization.length > 0 ||
            recommendations.contentSuggestions.length > 0 ||
            recommendations.engagementTips.length > 0
              ? `
          <div style="margin-bottom: 40px;">
            <h2 style="color: #6932FF !important; font-size: 24px; font-weight: 700; margin-bottom: 20px; font-family: 'Poppins', Arial, sans-serif; border-bottom: 3px solid #6932FF; padding-bottom: 10px;">🎯 Recommendations</h2>
            
            ${recommendations.streamOptimization
              .map(
                (rec) =>
                  `<div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px; margin: 12px 0; border-radius: 0 8px 8px 0;">
                <strong style="color: #059669;">⚡ Stream Optimization:</strong> ${rec}
              </div>`
              )
              .join('')}
            
            ${recommendations.contentSuggestions
              .map(
                (rec) =>
                  `<div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px; margin: 12px 0; border-radius: 0 8px 8px 0;">
                <strong style="color: #059669;">🎨 Content:</strong> ${rec}
              </div>`
              )
              .join('')}
            
            ${recommendations.engagementTips
              .map(
                (rec) =>
                  `<div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px; margin: 12px 0; border-radius: 0 8px 8px 0;">
                <strong style="color: #059669;">💬 Engagement:</strong> ${rec}
              </div>`
              )
              .join('')}
          </div>
          `
              : ''
          }

          <!-- Call to Action -->
          <div style="background: rgba(105, 50, 255, 0.05); border: 2px solid #6932FF; border-radius: 12px; padding: 30px; text-align: center; margin-bottom: 30px;">
            <h3 style="color: #6932FF !important; font-size: 20px; font-weight: 700; margin: 0 0 15px 0; font-family: 'Poppins', Arial, sans-serif;">Ready to level up your next stream?</h3>
            <p style="color: #374151; margin: 15px 0; font-size: 16px;">This comprehensive analysis helps you understand what resonated with your audience and provides actionable insights to grow your streaming success.</p>
            <a href="https://heycasi.com" style="display: inline-block; background: linear-gradient(135deg, #6932FF 0%, #932FFE 100%); color: white; padding: 15px 30px; border-radius: 25px; text-decoration: none; font-weight: 600; font-size: 16px; margin-top: 15px; font-family: 'Poppins', Arial, sans-serif;">
              🚀 Analyze Your Next Stream
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f8f9fb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
          <div style="text-align: center; margin-bottom: 15px;">
            <img src="${casiLogoUrl}" alt="Casi" style="height: 20px; vertical-align: middle;" onerror="this.style.display='none'" />
            <img src="${robotImageUrl}" alt="Casi Robot" style="width: 20px; height: 20px; border-radius: 50%; margin-left: 8px; vertical-align: middle;" onerror="this.style.display='none'" />
          </div>
          <p style="margin: 8px 0; color: #6b7280 !important; font-size: 14px; font-family: 'Poppins', Arial, sans-serif;"><strong style="color: #6932FF !important;">Your stream's brainy co-pilot</strong></p>
          <p style="margin: 8px 0; color: #6b7280 !important; font-size: 13px;">Questions? Just reply to this email - we're here to help!</p>
          <p style="margin: 15px 0 0 0; font-size: 12px; color: #5EEAD4 !important;">
            Visit <a href="https://heycasi.com" style="color: #5EEAD4 !important; text-decoration: none; font-weight: 600;">heycasi.com</a> to get started with your next stream
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}
