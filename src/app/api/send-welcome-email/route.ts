// API endpoint to send welcome email to new beta signups
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const DEMO_REPORT_URL = 'https://heycasi.com/report/b5231257-5793-49b1-8579-3f54668a61b3'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Send welcome email
    const { data, error } = await resend.emails.send({
      from: 'Casi <noreply@heycasi.com>',
      to: email,
      subject: '🎮 Welcome to Casi Beta - Your VIP Access Awaits',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to Casi Beta</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0f;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0f; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; border: 1px solid rgba(105, 50, 255, 0.3); box-shadow: 0 8px 32px rgba(105, 50, 255, 0.2);">

                    <!-- Header with Logo -->
                    <tr>
                      <td style="padding: 48px 40px 32px 40px; text-align: center;">
                        <img src="https://heycasi.com/landing-logo.png" alt="Casi" style="max-width: 200px; height: auto; margin-bottom: 24px; filter: brightness(1.2);" />
                        <h1 style="margin: 0; color: white; font-size: 36px; font-weight: 900; letter-spacing: -0.5px;">
                          🎉 Welcome to Casi!
                        </h1>
                        <p style="margin: 16px 0 0 0; color: #5EEAD4; font-size: 18px; font-weight: 600;">
                          You're officially a VIP Beta Tester
                        </p>
                      </td>
                    </tr>

                    <!-- Robot Mascot -->
                    <tr>
                      <td align="center" style="padding: 0 40px;">
                        <img src="https://heycasi.com/landing-robot.png" alt="Casi Robot" style="width: 120px; height: auto; margin: 0 auto;" />
                      </td>
                    </tr>

                    <!-- Welcome Message -->
                    <tr>
                      <td style="padding: 32px 40px;">
                        <p style="margin: 0 0 16px 0; color: rgba(255, 255, 255, 0.9); font-size: 16px; line-height: 1.6;">
                          Thanks for joining our beta! You're one of the first streamers to experience Casi's AI-powered stream analytics. 🚀
                        </p>
                        <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-size: 16px; line-height: 1.6;">
                          We're here to help you understand your chat, find your best clip moments, and grow your stream - all automatically.
                        </p>
                      </td>
                    </tr>

                    <!-- What Happens Next -->
                    <tr>
                      <td style="padding: 16px 40px;">
                        <div style="background: rgba(105, 50, 255, 0.1); border: 2px solid rgba(105, 50, 255, 0.3); border-radius: 12px; padding: 24px;">
                          <h2 style="margin: 0 0 20px 0; color: white; font-size: 20px; font-weight: 700;">
                            📋 What Happens Next
                          </h2>

                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding: 12px 0;">
                                <div style="display: flex; align-items: flex-start;">
                                  <div style="background: #10B981; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; flex-shrink: 0; margin-right: 16px;">✓</div>
                                  <div>
                                    <div style="color: white; font-weight: 600; font-size: 15px; margin-bottom: 4px;">1. Connect Your Twitch</div>
                                    <div style="color: rgba(255, 255, 255, 0.7); font-size: 14px;">Takes 30 seconds - secure OAuth login</div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 12px 0;">
                                <div style="display: flex; align-items: flex-start;">
                                  <div style="background: rgba(255, 255, 255, 0.2); color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; flex-shrink: 0; margin-right: 16px;">⏱️</div>
                                  <div>
                                    <div style="color: white; font-weight: 600; font-size: 15px; margin-bottom: 4px;">2. Stream as Normal</div>
                                    <div style="color: rgba(255, 255, 255, 0.7); font-size: 14px;">Casi works in the background analyzing your chat</div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 12px 0;">
                                <div style="display: flex; align-items: flex-start;">
                                  <div style="background: rgba(255, 255, 255, 0.2); color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; flex-shrink: 0; margin-right: 16px;">📧</div>
                                  <div>
                                    <div style="color: white; font-weight: 600; font-size: 15px; margin-bottom: 4px;">3. Get Your Report</div>
                                    <div style="color: rgba(255, 255, 255, 0.7); font-size: 14px;">Check email after stream for your detailed analytics</div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          </table>
                        </div>
                      </td>
                    </tr>

                    <!-- Primary CTA -->
                    <tr>
                      <td align="center" style="padding: 32px 40px 16px 40px;">
                        <a href="https://heycasi.com/login"
                           style="display: inline-block; background: linear-gradient(135deg, #6932FF, #932FFE); color: white; padding: 16px 48px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 18px; box-shadow: 0 4px 20px rgba(105, 50, 255, 0.4); transition: all 0.3s ease;">
                          🚀 Connect Your Twitch Account
                        </a>
                      </td>
                    </tr>

                    <!-- Demo CTA -->
                    <tr>
                      <td align="center" style="padding: 8px 40px 32px 40px;">
                        <a href="${DEMO_REPORT_URL}"
                           style="display: inline-block; color: #5EEAD4; text-decoration: none; font-weight: 600; font-size: 14px;">
                          or view a demo report first →
                        </a>
                      </td>
                    </tr>

                    <!-- What Makes Casi Special -->
                    <tr>
                      <td style="padding: 16px 40px;">
                        <h2 style="margin: 0 0 20px 0; color: white; font-size: 20px; font-weight: 700; text-align: center;">
                          ✨ What Makes Casi Special
                        </h2>

                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding: 12px 0;">
                              <div style="display: flex; align-items: flex-start;">
                                <div style="font-size: 28px; margin-right: 16px; flex-shrink: 0;">🎬</div>
                                <div>
                                  <div style="color: white; font-weight: 600; font-size: 15px; margin-bottom: 4px;">Clip Moment Detection</div>
                                  <div style="color: rgba(255, 255, 255, 0.7); font-size: 14px;">AI finds your best moments with exact timestamps - no more VOD review</div>
                                </div>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 12px 0;">
                              <div style="display: flex; align-items: flex-start;">
                                <div style="font-size: 28px; margin-right: 16px; flex-shrink: 0;">❓</div>
                                <div>
                                  <div style="color: white; font-weight: 600; font-size: 15px; margin-bottom: 4px;">Question Tracking</div>
                                  <div style="color: rgba(255, 255, 255, 0.7); font-size: 14px;">Never miss viewer questions in fast-moving chat</div>
                                </div>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 12px 0;">
                              <div style="display: flex; align-items: flex-start;">
                                <div style="font-size: 28px; margin-right: 16px; flex-shrink: 0;">🌍</div>
                                <div>
                                  <div style="color: white; font-weight: 600; font-size: 15px; margin-bottom: 4px;">Multilingual Analysis</div>
                                  <div style="color: rgba(255, 255, 255, 0.7); font-size: 14px;">Supports 13+ languages with sentiment analysis</div>
                                </div>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 12px 0;">
                              <div style="display: flex; align-items: flex-start;">
                                <div style="font-size: 28px; margin-right: 16px; flex-shrink: 0;">📈</div>
                                <div>
                                  <div style="color: white; font-weight: 600; font-size: 15px; margin-bottom: 4px;">Growth Tracking</div>
                                  <div style="color: rgba(255, 255, 255, 0.7); font-size: 14px;">Compare each stream to your previous one with actionable insights</div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Beta Perks -->
                    <tr>
                      <td style="padding: 16px 40px 32px 40px;">
                        <div style="background: linear-gradient(135deg, rgba(94, 234, 212, 0.1), rgba(105, 50, 255, 0.1)); border: 2px solid rgba(94, 234, 212, 0.3); border-radius: 12px; padding: 24px; text-align: center;">
                          <h3 style="margin: 0 0 12px 0; color: #5EEAD4; font-size: 18px; font-weight: 700;">
                            🎁 Your Beta Tester Perks
                          </h3>
                          <div style="color: rgba(255, 255, 255, 0.85); font-size: 14px; line-height: 1.6;">
                            ✅ Free access during entire beta period<br/>
                            ✅ Direct line to founders (we read every message!)<br/>
                            ✅ Your feedback shapes the product<br/>
                            ✅ Exclusive early bird pricing when we launch
                          </div>
                        </div>
                      </td>
                    </tr>

                    <!-- Getting Help -->
                    <tr>
                      <td style="padding: 16px 40px 48px 40px;">
                        <h3 style="margin: 0 0 16px 0; color: white; font-size: 18px; font-weight: 700; text-align: center;">
                          💬 Need Help?
                        </h3>
                        <div style="text-align: center;">
                          <a href="mailto:casi@heycasi.com" style="display: inline-block; margin: 0 8px 8px 8px; color: #5EEAD4; text-decoration: none; font-weight: 600; font-size: 14px;">
                            📧 Email Us
                          </a>
                          <span style="color: rgba(255, 255, 255, 0.3);">•</span>
                          <a href="https://heycasi.com/features" style="display: inline-block; margin: 0 8px 8px 8px; color: #5EEAD4; text-decoration: none; font-weight: 600; font-size: 14px;">
                            📚 View Features
                          </a>
                        </div>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="padding: 24px 40px; background: rgba(0, 0, 0, 0.3); text-align: center; border-radius: 0 0 16px 16px;">
                        <p style="margin: 0 0 8px 0; color: rgba(255, 255, 255, 0.5); font-size: 12px;">
                          Welcome aboard! We can't wait to see your streams grow 🚀
                        </p>
                        <p style="margin: 0; color: rgba(255, 255, 255, 0.5); font-size: 12px;">
                          <a href="https://heycasi.com" style="color: #6932FF; text-decoration: none;">heycasi.com</a>
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
      console.error('Failed to send welcome email:', error)
      return NextResponse.json({ error: 'Failed to send welcome email' }, { status: 500 })
    }

    console.log('✅ Welcome email sent to:', email)
    return NextResponse.json({ success: true, emailId: data?.id })
  } catch (error: any) {
    console.error('Welcome email API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
