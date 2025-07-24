export default function BetaSignup() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      padding: '2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Poppins, sans-serif'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '3rem',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        textAlign: 'center',
        maxWidth: '500px',
        width: '100%'
      }}>
        <h1 style={{
          color: 'white',
          fontSize: '2.5rem',
          marginBottom: '1rem',
          fontWeight: '700'
        }}>
          🎉 Beta Signup Works!
        </h1>
        <p style={{
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '1.1rem',
          lineHeight: '1.6'
        }}>
          The route is working! Now we just need to add the full form back.
        </p>
      </div>
    </div>
  )
}