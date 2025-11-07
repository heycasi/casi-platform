// API endpoint to notify admin when someone signs up for beta
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const ADMIN_EMAIL = 'casi@heycasi.com'

export async function POST(request: NextRequest) {
  try {
    const { email, source, timestamp } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Format timestamp nicely
    const signupDate = new Date(timestamp)
    const formattedDate = signupDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    })

    // Send notification email
    const { data, error } = await resend.emails.send({
      from: 'Casi <noreply@heycasi.com>',
      to: ADMIN_EMAIL,
      subject: `🎉 New Beta Signup: ${email}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Beta Signup</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

                    <!-- Header -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #6932FF, #932FFE); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
                        <h1 style="margin: 0; color: white; font-size: 32px; font-weight: 700;">
                          🎉 New Beta Signup!
                        </h1>
                      </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px;">

                        <!-- Signup Details -->
                        <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                          <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 18px; font-weight: 600;">
                            Signup Details
                          </h2>

                          <table width="100%" cellpadding="8" cellspacing="0">
                            <tr>
                              <td style="color: #6b7280; font-size: 14px; font-weight: 600; vertical-align: top; width: 120px;">
                                Email:
                              </td>
                              <td style="color: #111827; font-size: 14px;">
                                <strong>${email}</strong>
                              </td>
                            </tr>
                            <tr>
                              <td style="color: #6b7280; font-size: 14px; font-weight: 600; vertical-align: top;">
                                Source:
                              </td>
                              <td style="color: #111827; font-size: 14px;">
                                ${source}
                              </td>
                            </tr>
                            <tr>
                              <td style="color: #6b7280; font-size: 14px; font-weight: 600; vertical-align: top;">
                                Time:
                              </td>
                              <td style="color: #111827; font-size: 14px;">
                                ${formattedDate}
                              </td>
                            </tr>
                          </table>
                        </div>

                        <!-- Quick Actions -->
                        <div style="margin-top: 32px;">
                          <h3 style="margin: 0 0 16px 0; color: #111827; font-size: 16px; font-weight: 600;">
                            Quick Actions
                          </h3>

                          <a href="https://heycasi.com/admin/users"
                             style="display: inline-block; background: linear-gradient(135deg, #6932FF, #932FFE); color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin-right: 12px; margin-bottom: 12px;">
                            View All Signups
                          </a>

                          <a href="mailto:${email}"
                             style="display: inline-block; background: #f3f4f6; color: #374151; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin-bottom: 12px;">
                            Email Them
                          </a>
                        </div>

                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="padding: 24px; background-color: #f9fafb; text-align: center; border-radius: 0 0 12px 12px;">
                        <p style="margin: 0; color: #6b7280; font-size: 12px;">
                          This is an automated notification from Casi Platform
                        </p>
                        <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 12px;">
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
      console.error('Failed to send notification email:', error)
      return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 })
    }

    console.log('✅ Beta signup notification sent:', email)
    return NextResponse.json({ success: true, emailId: data?.id })
  } catch (error: any) {
    console.error('Notification API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
