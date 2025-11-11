import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email, betaCode } = await request.json()

    if (!email || !betaCode) {
      return NextResponse.json({ error: 'Email and beta code are required' }, { status: 400 })
    }

    const { data, error } = await resend.emails.send({
      from: 'Casi <noreply@heycasi.com>',
      to: [email],
      subject: '🎉 Your Casi Beta Access Code is Ready!',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Casi Beta Code</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Poppins', Arial, sans-serif; background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.1); overflow: hidden;">

          <!-- Header with Logo -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center;">
              <img src="https://heycasi.com/landing-logo.png" alt="Casi" style="width: 200px; height: auto; margin-bottom: 20px;">
              <h1 style="color: white; font-size: 28px; font-weight: 700; margin: 0 0 10px 0;">Welcome to Casi Beta! 🎉</h1>
              <p style="color: rgba(255, 255, 255, 0.8); font-size: 16px; line-height: 1.6; margin: 0;">Your exclusive beta access code is ready</p>
            </td>
          </tr>

          <!-- Beta Code Box -->
          <tr>
            <td style="padding: 20px 40px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #6932FF, #932FFE); border-radius: 15px; padding: 30px; box-shadow: 0 8px 25px rgba(105, 50, 255, 0.3);">
                <tr>
                  <td style="text-align: center;">
                    <p style="color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 600; margin: 0 0 10px 0; letter-spacing: 1px;">YOUR BETA CODE</p>
                    <p style="color: white; font-size: 32px; font-weight: 700; margin: 0; letter-spacing: 2px; font-family: 'Courier New', monospace;">${betaCode}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Benefits Section -->
          <tr>
            <td style="padding: 20px 40px;">
              <h2 style="color: white; font-size: 20px; font-weight: 600; margin: 0 0 20px 0;">What's Included:</h2>
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="width: 30px; vertical-align: top;">
                          <span style="color: #5EEAD4; font-size: 20px;">✓</span>
                        </td>
                        <td>
                          <p style="color: rgba(255, 255, 255, 0.9); font-size: 15px; margin: 0; line-height: 1.5;"><strong>14 Days Free Access</strong> to all Creator tier features</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="width: 30px; vertical-align: top;">
                          <span style="color: #5EEAD4; font-size: 20px;">✓</span>
                        </td>
                        <td>
                          <p style="color: rgba(255, 255, 255, 0.9); font-size: 15px; margin: 0; line-height: 1.5;"><strong>Real-time Chat Analytics</strong> with AI-powered insights</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="width: 30px; vertical-align: top;">
                          <span style="color: #5EEAD4; font-size: 20px;">✓</span>
                        </td>
                        <td>
                          <p style="color: rgba(255, 255, 255, 0.9); font-size: 15px; margin: 0; line-height: 1.5;"><strong>Sentiment Tracking</strong> and question detection</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="width: 30px; vertical-align: top;">
                          <span style="color: #5EEAD4; font-size: 20px;">✓</span>
                        </td>
                        <td>
                          <p style="color: rgba(255, 255, 255, 0.9); font-size: 15px; margin: 0; line-height: 1.5;"><strong>Post-Stream Reports</strong> delivered to your email</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="width: 30px; vertical-align: top;">
                          <span style="color: #5EEAD4; font-size: 20px;">✓</span>
                        </td>
                        <td>
                          <p style="color: rgba(255, 255, 255, 0.9); font-size: 15px; margin: 0; line-height: 1.5;"><strong>Priority Support</strong> from our beta team</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 30px 40px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center">
                    <a href="https://heycasi.com/signup" style="display: inline-block; background: linear-gradient(135deg, #6932FF, #932FFE); color: white; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-size: 16px; font-weight: 600; box-shadow: 0 8px 25px rgba(105, 50, 255, 0.3);">Get Started Now →</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Instructions -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background: rgba(255, 255, 255, 0.05); border-radius: 10px; padding: 20px;">
                <tr>
                  <td>
                    <h3 style="color: white; font-size: 16px; font-weight: 600; margin: 0 0 15px 0;">How to Activate:</h3>
                    <ol style="color: rgba(255, 255, 255, 0.8); font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                      <li>Click "Get Started Now" above or visit <a href="https://heycasi.com/signup" style="color: #6932FF; text-decoration: none;">heycasi.com/signup</a></li>
                      <li>Create your account with this email address</li>
                      <li>Enter your beta code: <strong style="color: white;">${betaCode}</strong></li>
                      <li>Connect your Twitch account and start streaming!</li>
                    </ol>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
              <p style="color: rgba(255, 255, 255, 0.6); font-size: 14px; line-height: 1.6; margin: 0 0 15px 0; text-align: center;">
                Have questions? We're here to help!<br>
                Reply to this email or join our <a href="https://twitter.com/HeyCasi_" style="color: #6932FF; text-decoration: none;">community on Twitter</a>
              </p>
              <p style="color: rgba(255, 255, 255, 0.5); font-size: 12px; text-align: center; margin: 0;">
                © 2025 Casi Platform. All rights reserved.<br>
                You received this because you signed up for Casi beta access.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Send beta code email error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
