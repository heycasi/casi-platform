'use client'

export default function LoginPage() {
  const handleTwitchLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID || '8lmg8rwlkhlom3idj51xka2eipxd18'
    
    // Detect if we're in production or development
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : 'https://heycasi.com'
    
    const redirectUri = `${baseUrl}/auth/callback`
    
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'user:read:email chat:read channel:read:subscriptions',
      force_verify: 'true'
    })

    const authUrl = `https://id.twitch.tv/oauth2/authorize?${params.toString()}`
    
    console.log('Redirecting to:', authUrl)
    window.location.href = authUrl
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md mx-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">
          🎮 Casi Platform
        </h1>
        
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Connect Your Stream
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Get real-time chat analysis, AI-powered insights, and boost your audience engagement.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleTwitchLogin}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-3 transform hover:scale-105"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
            </svg>
            Connect with Twitch
          </button>
          
          <div className="text-sm text-gray-500 space-y-1">
            <p>✅ Secure OAuth authentication</p>
            <p>✅ Read-only access to chat</p>
            <p>✅ No posting permissions required</p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            <p className="font-semibold">Phase 1: MVP Development</p>
            <p>Real-time Analytics • Privacy Protected • Beta Access</p>
          </div>
        </div>
      </div>
    </div>
  )
}
