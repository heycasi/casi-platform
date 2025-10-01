'use client'

import { useEffect, useState } from 'react'

interface Meteor {
  id: number
  x: number
  y: number
  length: number
  speed: number
  delay: number
}

export default function MeteorBackground() {
  const [meteors, setMeteors] = useState<Meteor[]>([])

  useEffect(() => {
    const meteorArray: Meteor[] = []
    for (let i = 0; i < 20; i++) {
      meteorArray.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * -100,
        length: Math.random() * 80 + 50,
        speed: Math.random() * 5 + 5,
        delay: Math.random() * 5
      })
    }
    setMeteors(meteorArray)
  }, [])

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 0,
      overflow: 'hidden'
    }}>
      {meteors.map((meteor) => (
        <div
          key={meteor.id}
          style={{
            position: 'absolute',
            left: `${meteor.x}%`,
            top: `${meteor.y}%`,
            width: `${meteor.length}px`,
            height: '2px',
            background: 'linear-gradient(90deg, transparent, rgba(105, 50, 255, 0.8), transparent)',
            transform: 'rotate(-45deg)',
            animation: `meteorFall ${meteor.speed}s linear ${meteor.delay}s infinite`
          }}
        />
      ))}
      <style jsx>{`
        @keyframes meteorFall {
          0% {
            transform: translateY(0) translateX(0) rotate(-45deg);
            opacity: 1;
          }
          70% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) translateX(100vh) rotate(-45deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
