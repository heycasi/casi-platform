import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export interface UpgradeNudgeParams {
  email: string
  userName: string
  currentTier: string
  avgViewers: number
  viewerLimit: number
}

export async function sendUpgradeNudgeEmail(params: UpgradeNudgeParams) {
  if (!resend) {
    throw new Error('Resend API key not configured')
  }

  const { email, userName, currentTier, avgViewers, viewerLimit } = params

  // Determine suggested tier
  const suggestedTier = currentTier === 'Creator' ? 'Pro' : 'Streamer+'
  const percentGrowth = Math.round(((avgViewers - viewerLimit) / viewerLimit) * 100)

  // Upgrade URL
  const upgradeUrl = `https://www.heycasi.com/account#upgrade`

  const emailContent = generateUpgradeNudgeEmail(
    userName,
    currentTier,
    avgViewers,
    viewerLimit,
    suggestedTier,
    upgradeUrl,
    percentGrowth
  )

  const { data, error } = await resend.emails.send({
    from: 'Casi <casi@heycasi.com>',
    to: [email],
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text
  })

  if (error) {
    console.error('Failed to send upgrade nudge email:', error)
    throw error
  }

  console.log('Upgrade nudge email sent:', data)
  return data
}

function generateUpgradeNudgeEmail(
  userName: string,
  currentTier: string,
  avgViewers: number,
  viewerLimit: number,
  suggestedTier: string,
  upgradeUrl: string,
  percentGrowth: number
) {
  return {
    subject: `🚀 Congrats ${userName}! Your stream is outgrowing the ${currentTier} tier`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #1a1a1a; color: #F7F7F7; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: linear-gradient(135deg, #2d2d2d, #1a1a1a); border-radius: 16px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.1); }
    .header { background: linear-gradient(135deg, #FFD700, #FFA500); padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; color: #000; }
    .content { padding: 30px; }
    .stat-box { background: rgba(94, 234, 212, 0.1); border: 1px solid rgba(94, 234, 212, 0.3); border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center; }
    .stat-number { font-size: 48px; font-weight: 700; color: #5EEAD4; margin: 0; }
    .stat-label { font-size: 14px; color: rgba(255, 255, 255, 0.7); margin: 10px 0 0 0; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #FFD700, #FFA500); color: #000; padding: 15px 40px; border-radius: 25px; text-decoration: none; font-weight: 700; font-size: 16px; margin: 20px 0; }
    .feature-list { list-style: none; padding: 0; }
    .feature-list li { padding: 10px 0; border-bottom: 1px dashed rgba(255, 255, 255, 0.1); }
    .feature-list li:before { content: '✓ '; color: #B8EE8A; font-weight: 700; margin-right: 10px; }
    .footer { text-align: center; padding: 20px; color: rgba(255, 255, 255, 0.5); font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Your Stream is Growing!</h1>
    </div>

    <div class="content">
      <p style="font-size: 16px; line-height: 1.6;">Hi ${userName},</p>

      <p style="font-size: 16px; line-height: 1.6;">
        Fantastic news! Over the past 30 days, your stream has been <strong>crushing it</strong>.
        Your average viewership has grown beyond your current ${currentTier} tier limits.
      </p>

      <div class="stat-box">
        <p class="stat-number">${avgViewers}</p>
        <p class="stat-label">Average Viewers (${percentGrowth}% over your ${viewerLimit} viewer limit)</p>
      </div>

      <p style="font-size: 16px; line-height: 1.6;">
        This kind of growth deserves better tools! Upgrade to <strong>${suggestedTier}</strong>
        to unlock features built for your audience size:
      </p>

      <ul class="feature-list">
        ${currentTier === 'Creator' ? `
          <li>Support for up to 250 average viewers</li>
          <li>Advanced sentiment analysis for deeper insights</li>
          <li>Priority question alerts so you never miss engagement</li>
          <li>Export analytics reports to track your growth</li>
          <li>Priority support from our team</li>
          <li>Multi-platform dashboard integrations</li>
        ` : `
          <li>Unlimited average viewers</li>
          <li>AI response suggestions for chat interaction</li>
          <li>OBS overlay integration for on-stream analytics</li>
          <li>Custom alerts & webhook integrations</li>
          <li>Dedicated account manager for personalized support</li>
          <li>White-label options & full API access</li>
        `}
      </ul>

      <div style="text-align: center;">
        <a href="${upgradeUrl}" class="cta-button">Upgrade to ${suggestedTier}</a>
      </div>

      <p style="font-size: 14px; line-height: 1.6; color: rgba(255, 255, 255, 0.7); margin-top: 30px;">
        <strong>Note:</strong> Your current plan will continue working without interruption.
        We're just letting you know that upgrading will give you better analytics and support
        as your community grows.
      </p>
    </div>

    <div class="footer">
      <p>Casi • Your stream's brainy co-pilot</p>
      <p><a href="https://heycasi.com" style="color: #5EEAD4; text-decoration: none;">heycasi.com</a></p>
    </div>
  </div>
</body>
</html>
    `,
    text: `
Hi ${userName},

Fantastic news! Your stream is growing!

Over the past 30 days, you've been averaging ${avgViewers} viewers - that's ${percentGrowth}% over your ${currentTier} tier limit of ${viewerLimit}.

Upgrade to ${suggestedTier} to unlock:
${currentTier === 'Creator' ? `
- Support for up to 250 average viewers
- Advanced sentiment analysis
- Priority question alerts
- Export analytics reports
- Priority support
- Multi-platform dashboard
` : `
- Unlimited average viewers
- AI response suggestions
- OBS overlay integration
- Custom alerts & webhooks
- Dedicated account manager
- White-label options & API access
`}

Upgrade now: ${upgradeUrl}

Your current plan will continue working - we're just letting you know upgrading will give you better tools as your community grows.

Casi • Your stream's brainy co-pilot
https://heycasi.com
    `
  }
}
