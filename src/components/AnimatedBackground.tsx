'use client'

export default function AnimatedBackground() {
  return (
    <>
      {/* Animated Gradient Background */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
        background: 'linear-gradient(135deg, #0B0D14 0%, #1a1d2e 50%, #0B0D14 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 15s ease infinite'
      }} />

      {/* Floating Orbs */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
        pointerEvents: 'none',
        overflow: 'hidden'
      }}>
        {/* Purple Orb */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(105, 50, 255, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          animation: 'float 20s ease-in-out infinite'
        }} />

        {/* Pink Orb */}
        <div style={{
          position: 'absolute',
          top: '60%',
          right: '10%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(147, 47, 254, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          animation: 'float 25s ease-in-out infinite reverse'
        }} />

        {/* Teal Orb */}
        <div style={{
          position: 'absolute',
          bottom: '10%',
          left: '50%',
          width: '350px',
          height: '350px',
          background: 'radial-gradient(circle, rgba(94, 234, 212, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          animation: 'float 30s ease-in-out infinite'
        }} />
      </div>

      {/* Grid Pattern Overlay */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
        backgroundImage: `
          linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
        opacity: 0.5
      }} />

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes gradientShift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -30px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
      `}</style>
    </>
  )
}
