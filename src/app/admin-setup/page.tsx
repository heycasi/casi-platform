'use client'

import { useEffect, useState } from 'react'

export default function AdminSetup() {
  const [twitchUser, setTwitchUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const twitchUserRaw = localStorage.getItem('twitch_user')
    if (twitchUserRaw) {
      try {
        const user = JSON.parse(twitchUserRaw)
        setTwitchUser(user)
      } catch (e) {
        console.error('Failed to parse Twitch user:', e)
      }
    }
    setIsLoading(false)
  }, [])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Poppins, Arial, sans-serif',
        color: 'white'
      }}>
        Loading...
      </div>
    )
  }

  if (!twitchUser) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Poppins, Arial, sans-serif',
        padding: '1rem'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '2rem',
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h1 style={{
            color: 'white',
            fontSize: '2rem',
            fontWeight: 'bold',
            margin: '0 0 1rem 0'
          }}>
            🔒 Not Logged In
          </h1>
          <p style={{
            color: 'rgba(255, 255, 255, 0.8)',
            margin: '0 0 1.5rem 0',
            fontSize: '1rem'
          }}>
            Please log in with Twitch first to view your admin credentials.
          </p>
          <a
            href="/login"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #6932FF, #932FFE)',
              borderRadius: '25px',
              color: 'white',
              textDecoration: 'none',
              fontWeight: 600,
              fontFamily: 'Poppins, Arial, sans-serif'
            }}
          >
            Go to Login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      fontFamily: 'Poppins, Arial, sans-serif',
      padding: '2rem',
      color: 'white'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            margin: '0 0 0.5rem 0',
            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            👑 Admin Setup
          </h1>
          <p style={{
            color: 'rgba(255, 255, 255, 0.7)',
            margin: 0,
            fontSize: '1rem'
          }}>
            Copy your credentials to enable admin access
          </p>
        </div>

        {/* Credentials Box */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '20px',
          padding: '2rem',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          marginBottom: '2rem'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            margin: '0 0 1.5rem 0',
            color: '#5EEAD4'
          }}>
            Your Twitch Credentials
          </h2>

          {/* User ID */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '0.9rem',
              marginBottom: '0.5rem',
              fontWeight: '600'
            }}>
              Twitch User ID
            </label>
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center'
            }}>
              <input
                type="text"
                value={twitchUser.id || 'N/A'}
                readOnly
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '1rem',
                  fontFamily: 'monospace'
                }}
              />
              <button
                onClick={() => copyToClipboard(twitchUser.id)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #5EEAD4, #3B82F6)',
                  border: 'none',
                  borderRadius: '10px',
                  color: 'white',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontFamily: 'Poppins, Arial, sans-serif',
                  whiteSpace: 'nowrap'
                }}
              >
                📋 Copy
              </button>
            </div>
          </div>

          {/* Username */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '0.9rem',
              marginBottom: '0.5rem',
              fontWeight: '600'
            }}>
              Twitch Username
            </label>
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center'
            }}>
              <input
                type="text"
                value={twitchUser.login || twitchUser.display_name || 'N/A'}
                readOnly
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '1rem',
                  fontFamily: 'monospace'
                }}
              />
              <button
                onClick={() => copyToClipboard(twitchUser.login || twitchUser.display_name)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #5EEAD4, #3B82F6)',
                  border: 'none',
                  borderRadius: '10px',
                  color: 'white',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontFamily: 'Poppins, Arial, sans-serif',
                  whiteSpace: 'nowrap'
                }}
              >
                📋 Copy
              </button>
            </div>
          </div>

          {/* Email */}
          <div>
            <label style={{
              display: 'block',
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '0.9rem',
              marginBottom: '0.5rem',
              fontWeight: '600'
            }}>
              Email Address
            </label>
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center'
            }}>
              <input
                type="text"
                value={twitchUser.email || 'N/A'}
                readOnly
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '1rem',
                  fontFamily: 'monospace'
                }}
              />
              <button
                onClick={() => copyToClipboard(twitchUser.email || '')}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #5EEAD4, #3B82F6)',
                  border: 'none',
                  borderRadius: '10px',
                  color: 'white',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontFamily: 'Poppins, Arial, sans-serif',
                  whiteSpace: 'nowrap'
                }}
              >
                📋 Copy
              </button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(147, 47, 254, 0.2), rgba(147, 47, 254, 0.1))',
          borderRadius: '20px',
          padding: '2rem',
          border: '1px solid rgba(147, 47, 254, 0.3)'
        }}>
          <h3 style={{
            fontSize: '1.3rem',
            margin: '0 0 1rem 0',
            color: '#F7F7F7'
          }}>
            📝 How to Enable Admin Access
          </h3>

          <ol style={{
            color: 'rgba(255, 255, 255, 0.85)',
            lineHeight: '1.8',
            paddingLeft: '1.5rem',
            margin: 0
          }}>
            <li style={{ marginBottom: '0.75rem' }}>
              Open <code style={{
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                color: '#5EEAD4'
              }}>src/app/dashboard/page.tsx</code>
            </li>
            <li style={{ marginBottom: '0.75rem' }}>
              Find lines 44-52 (the admin configuration section)
            </li>
            <li style={{ marginBottom: '0.75rem' }}>
              Add your <strong>Twitch User ID</strong> to the <code style={{
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                color: '#5EEAD4'
              }}>ADMIN_USER_IDS</code> array:
              <pre style={{
                background: 'rgba(0, 0, 0, 0.5)',
                padding: '1rem',
                borderRadius: '8px',
                marginTop: '0.5rem',
                overflow: 'auto',
                fontSize: '0.9rem'
              }}>{`const ADMIN_USER_IDS = [\n  '${twitchUser.id}' // Your Twitch ID\n]`}</pre>
            </li>
            <li style={{ marginBottom: '0.75rem' }}>
              OR add your <strong>Email</strong> to the <code style={{
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                color: '#5EEAD4'
              }}>ADMIN_EMAILS</code> array:
              <pre style={{
                background: 'rgba(0, 0, 0, 0.5)',
                padding: '1rem',
                borderRadius: '8px',
                marginTop: '0.5rem',
                overflow: 'auto',
                fontSize: '0.9rem'
              }}>{`const ADMIN_EMAILS = [\n  '${twitchUser.email || 'your-email@example.com'}'\n]`}</pre>
            </li>
            <li>
              Save the file and refresh the dashboard - you'll see the 👑 ADMIN badge!
            </li>
          </ol>
        </div>

        {/* Navigation */}
        <div style={{
          marginTop: '2rem',
          textAlign: 'center'
        }}>
          <a
            href="/dashboard"
            style={{
              display: 'inline-block',
              padding: '0.75rem 2rem',
              background: 'linear-gradient(135deg, #6932FF, #932FFE)',
              borderRadius: '25px',
              color: 'white',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '1rem',
              fontFamily: 'Poppins, Arial, sans-serif',
              marginRight: '1rem'
            }}
          >
            Go to Dashboard
          </a>
          <a
            href="/"
            style={{
              display: 'inline-block',
              padding: '0.75rem 2rem',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '25px',
              color: 'white',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '1rem',
              fontFamily: 'Poppins, Arial, sans-serif'
            }}
          >
            Back to Home
          </a>
        </div>

        {/* Debug Info */}
        <details style={{
          marginTop: '2rem',
          background: 'rgba(0, 0, 0, 0.3)',
          padding: '1rem',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <summary style={{
            cursor: 'pointer',
            fontWeight: '600',
            color: 'rgba(255, 255, 255, 0.7)',
            marginBottom: '1rem'
          }}>
            🔍 Full User Object (for debugging)
          </summary>
          <pre style={{
            background: 'rgba(0, 0, 0, 0.5)',
            padding: '1rem',
            borderRadius: '8px',
            overflow: 'auto',
            fontSize: '0.8rem',
            color: '#5EEAD4',
            margin: 0
          }}>
            {JSON.stringify(twitchUser, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  )
}