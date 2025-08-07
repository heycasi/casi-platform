'use client'
import { useState, useEffect } from 'react'

export default function About() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      fontFamily: 'Poppins, Arial, sans-serif',
      color: 'white'
    }}>
      {/* Header with Navigation */}
      <header style={{
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img 
            src="/landing-logo.png" 
            alt="Casi" 
            style={{ height: '2rem', width: 'auto' }}
            onError={(e) => {
              const target = e.target as HTMLImageElement
              const fallback = document.createElement('h1')
              fallback.style.cssText = 'margin: 0; font-size: 1.3rem; font-weight: bold; background: linear-gradient(135deg, #5EEAD4, #FF9F9F, #932FFE); -webkit-background-clip: text; -webkit-text-fill-color: transparent;'
              fallback.textContent = 'Casi'
              target.parentNode?.appendChild(fallback)
              target.style.display = 'none'
            }}
          />
          <img 
            src="/landing-robot.png" 
            alt="Casi Robot" 
            style={{ height: '2rem', width: '2rem', borderRadius: '50%' }}
            onError={(e) => {
              const target = e.target as HTMLImageElement
              const fallback = document.createElement('div')
              fallback.style.cssText = 'width: 32px; height: 32px; background: #B8EE8A; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1rem;'
              fallback.textContent = '🤖'
              target.parentNode?.appendChild(fallback)
              target.style.display = 'none'
            }}
          />
        </div>
        <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <a 
            href="/" 
            style={{ 
              color: '#5EEAD4', 
              textDecoration: 'none', 
              fontWeight: '500',
              transition: 'color 0.3s ease'
            }}
          >
            Home
          </a>
          <a 
            href="/dashboard" 
            style={{ 
              color: 'white', 
              textDecoration: 'none', 
              fontWeight: '500',
              transition: 'color 0.3s ease'
            }}
          >
            Dashboard
          </a>
        </nav>
      </header>

      {/* Hero Section */}
      <section style={{
        padding: '4rem 2rem',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #6932FF 0%, #932FFE 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 30% 50%, rgba(94, 234, 212, 0.1) 0%, transparent 50%)',
        }} />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{
            margin: '0 0 1.5rem 0',
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #FFFFFF, #B8EE8A)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            About Casi
          </h1>
          <p style={{
            fontSize: '1.25rem',
            opacity: '0.9',
            lineHeight: '1.6',
            margin: '0 0 2rem 0'
          }}>
            Born from passion, built for streamers
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section style={{
        padding: '4rem 2rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{
          background: 'rgba(105, 50, 255, 0.1)',
          border: '2px solid #6932FF',
          borderRadius: '20px',
          padding: '3rem',
          textAlign: 'center',
          marginBottom: '4rem'
        }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#5EEAD4',
            marginBottom: '1.5rem'
          }}>
            Our Mission
          </h2>
          <p style={{
            fontSize: '1.25rem',
            lineHeight: '1.8',
            color: '#FFFFFF',
            fontWeight: '500'
          }}>
            Transform how streamers connect with their communities through 
            <span style={{ color: '#B8EE8A', fontWeight: '700' }}> data-driven insights</span> and 
            <span style={{ color: '#FF9F9F', fontWeight: '700' }}> AI-powered engagement optimisation</span>.
          </p>
        </div>

        {/* Our Story */}
        <div style={{ marginBottom: '4rem' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: '2rem',
            background: 'linear-gradient(135deg, #5EEAD4, #FF9F9F)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Our Story
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            marginBottom: '3rem'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '15px',
              padding: '2rem',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎮</div>
              <h3 style={{ color: '#5EEAD4', fontSize: '1.5rem', marginBottom: '1rem' }}>Gaming Connection</h3>
              <p style={{ lineHeight: '1.6', opacity: '0.9' }}>
                It all started in the gaming community. Two passionate gamers who understood the struggles 
                of building and engaging with streaming audiences in an increasingly crowded space.
              </p>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '15px',
              padding: '2rem',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💡</div>
              <h3 style={{ color: '#FF9F9F', fontSize: '1.5rem', marginBottom: '1rem' }}>The Problem</h3>
              <p style={{ lineHeight: '1.6', opacity: '0.9' }}>
                We watched talented streamers struggle with chat overload, miss important viewer questions, 
                and have no way to understand what content truly resonated with their communities.
              </p>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '15px',
              padding: '2rem',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀</div>
              <h3 style={{ color: '#B8EE8A', fontSize: '1.5rem', marginBottom: '1rem' }}>The Solution</h3>
              <p style={{ lineHeight: '1.6', opacity: '0.9' }}>
                Combining data science expertise with deep streaming knowledge, we built Casi - 
                the AI co-pilot every streamer deserves to have by their side.
              </p>
            </div>
          </div>
        </div>

        {/* Founders Section */}
        <div style={{ marginBottom: '4rem' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: '3rem',
            background: 'linear-gradient(135deg, #6932FF, #932FFE)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Meet the Founders
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '3rem',
            maxWidth: '1000px',
            margin: '0 auto'
          }}>
            {/* Connor Dahl */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(105, 50, 255, 0.1), rgba(94, 234, 212, 0.1))',
              border: '2px solid #6932FF',
              borderRadius: '20px',
              padding: '2.5rem',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '-50%',
                right: '-50%',
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle, rgba(94, 234, 212, 0.1) 0%, transparent 70%)',
                opacity: '0.5'
              }} />
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{
                  width: '120px',
                  height: '120px',
                  margin: '0 auto 1.5rem',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '3px solid #5EEAD4',
                  background: 'linear-gradient(135deg, #6932FF, #5EEAD4)'
                }}>
                  <img 
                    src="/Connor.png" 
                    alt="Connor Dahl" 
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover' 
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      const fallback = document.createElement('div')
                      fallback.style.cssText = 'width: 100%; height: 100%; background: linear-gradient(135deg, #6932FF, #5EEAD4); display: flex; align-items: center; justify-content: center; font-size: 3rem; color: white; font-weight: 700;'
                      fallback.textContent = 'CD'
                      target.parentNode?.appendChild(fallback)
                      target.style.display = 'none'
                    }}
                  />
                </div>
                <h3 style={{
                  fontSize: '1.75rem',
                  fontWeight: '700',
                  color: '#5EEAD4',
                  marginBottom: '0.5rem'
                }}>
                  Connor Dahl
                </h3>
                <p style={{
                  color: '#B8EE8A',
                  fontWeight: '600',
                  marginBottom: '1.5rem',
                  fontSize: '1.1rem'
                }}>
                  Co-Founder & Data Architect
                </p>
                <p style={{
                  lineHeight: '1.6',
                  opacity: '0.9',
                  marginBottom: '1.5rem'
                }}>
                  With a deep background in <strong style={{ color: '#5EEAD4' }}>Data & Analytics</strong> and 
                  an unwavering passion for gaming, Connor brings the technical expertise that powers 
                  Casi's intelligent insights. He understands both the science behind the data and 
                  the heart of gaming communities.
                </p>
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '1rem',
                  flexWrap: 'wrap'
                }}>
                  <span style={{
                    background: '#5EEAD4',
                    color: '#1a1a1a',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}>
                    Data Science
                  </span>
                  <span style={{
                    background: '#B8EE8A',
                    color: '#1a1a1a',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}>
                    Gaming Enthusiast
                  </span>
                </div>
              </div>
            </div>

            {/* Ellie-Jade Farrington */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(147, 47, 254, 0.1), rgba(255, 159, 159, 0.1))',
              border: '2px solid #932FFE',
              borderRadius: '20px',
              padding: '2.5rem',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle, rgba(255, 159, 159, 0.1) 0%, transparent 70%)',
                opacity: '0.5'
              }} />
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{
                  width: '120px',
                  height: '120px',
                  margin: '0 auto 1.5rem',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '3px solid #FF9F9F',
                  background: 'linear-gradient(135deg, #932FFE, #FF9F9F)'
                }}>
                  <img 
                    src="/Elliepng.png" 
                    alt="Ellie-Jade Farrington" 
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover' 
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      const fallback = document.createElement('div')
                      fallback.style.cssText = 'width: 100%; height: 100%; background: linear-gradient(135deg, #932FFE, #FF9F9F); display: flex; align-items: center; justify-content: center; font-size: 3rem; color: white; font-weight: 700;'
                      fallback.textContent = 'EJ'
                      target.parentNode?.appendChild(fallback)
                      target.style.display = 'none'
                    }}
                  />
                </div>
                <h3 style={{
                  fontSize: '1.75rem',
                  fontWeight: '700',
                  color: '#FF9F9F',
                  marginBottom: '0.5rem'
                }}>
                  Ellie-Jade Farrington
                </h3>
                <p style={{
                  color: '#932FFE',
                  fontWeight: '600',
                  marginBottom: '1.5rem',
                  fontSize: '1.1rem'
                }}>
                  Co-Founder & Community Strategist
                </p>
                <p style={{
                  lineHeight: '1.6',
                  opacity: '0.9',
                  marginBottom: '1.5rem'
                }}>
                  A <strong style={{ color: '#FF9F9F' }}>marketing expert</strong> and 
                  <strong style={{ color: '#932FFE' }}> former streamer</strong> with an infectious 
                  passion for gaming, Ellie brings real-world streaming experience and deep 
                  understanding of what creators truly need to build thriving communities.
                </p>
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '1rem',
                  flexWrap: 'wrap'
                }}>
                  <span style={{
                    background: '#FF9F9F',
                    color: '#1a1a1a',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}>
                    Marketing
                  </span>
                  <span style={{
                    background: '#932FFE',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}>
                    Ex-Streamer
                  </span>
                  <span style={{
                    background: '#B8EE8A',
                    color: '#1a1a1a',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}>
                    Gaming Passionate
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div style={{ marginBottom: '4rem' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: '3rem',
            background: 'linear-gradient(135deg, #FF9F9F, #B8EE8A)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            What We Believe
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            <div style={{
              background: 'rgba(94, 234, 212, 0.1)',
              border: '1px solid #5EEAD4',
              borderRadius: '15px',
              padding: '2rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎯</div>
              <h3 style={{ color: '#5EEAD4', fontSize: '1.3rem', marginBottom: '1rem' }}>Data-Driven Growth</h3>
              <p style={{ opacity: '0.9', lineHeight: '1.6' }}>
                Every streamer deserves insights that help them grow smarter, not just harder.
              </p>
            </div>
            <div style={{
              background: 'rgba(255, 159, 159, 0.1)',
              border: '1px solid #FF9F9F',
              borderRadius: '15px',
              padding: '2rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🤝</div>
              <h3 style={{ color: '#FF9F9F', fontSize: '1.3rem', marginBottom: '1rem' }}>Community First</h3>
              <p style={{ opacity: '0.9', lineHeight: '1.6' }}>
                Technology should strengthen the bond between streamers and their communities.
              </p>
            </div>
            <div style={{
              background: 'rgba(184, 238, 138, 0.1)',
              border: '1px solid #B8EE8A',
              borderRadius: '15px',
              padding: '2rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚡</div>
              <h3 style={{ color: '#B8EE8A', fontSize: '1.3rem', marginBottom: '1rem' }}>Simplicity Wins</h3>
              <p style={{ opacity: '0.9', lineHeight: '1.6' }}>
                Powerful features should be simple to use. Complexity is the enemy of adoption.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div style={{
          background: 'linear-gradient(135deg, #6932FF 0%, #932FFE 100%)',
          borderRadius: '25px',
          padding: '3rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 70% 30%, rgba(184, 238, 138, 0.2) 0%, transparent 60%)'
          }} />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: '700',
              marginBottom: '1rem',
              color: 'white'
            }}>
              Ready to Transform Your Streams?
            </h2>
            <p style={{
              fontSize: '1.1rem',
              opacity: '0.9',
              marginBottom: '2rem',
              maxWidth: '600px',
              margin: '0 auto 2rem'
            }}>
              Join the growing community of streamers who use data to build better connections 
              with their audiences.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a
                href="/"
                style={{
                  display: 'inline-block',
                  background: 'linear-gradient(135deg, #5EEAD4, #B8EE8A)',
                  color: '#1a1a1a',
                  padding: '1rem 2rem',
                  borderRadius: '50px',
                  textDecoration: 'none',
                  fontWeight: '700',
                  fontSize: '1.1rem',
                  transition: 'transform 0.3s ease'
                }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.transform = 'translateY(0)'}
              >
                🚀 Join Waitlist
              </a>
              <a
                href="/dashboard"
                style={{
                  display: 'inline-block',
                  border: '2px solid white',
                  color: 'white',
                  padding: '1rem 2rem',
                  borderRadius: '50px',
                  textDecoration: 'none',
                  fontWeight: '700',
                  fontSize: '1.1rem',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.background = 'white';
                  (e.target as HTMLElement).style.color = '#6932FF'
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.background = 'transparent';
                  (e.target as HTMLElement).style.color = 'white'
                }}
              >
                Try Dashboard
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: 'rgba(0, 0, 0, 0.3)',
        padding: '2rem',
        textAlign: 'center',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <span style={{ color: '#5EEAD4', fontSize: '1.25rem', fontWeight: '800' }}>Casi</span>
          <div style={{ width: '24px', height: '24px', background: '#B8EE8A', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>🤖</div>
        </div>
        <p style={{ opacity: '0.8', marginBottom: '1rem' }}>
          <strong style={{ color: '#6932FF' }}>Your stream's brainy co-pilot</strong>
        </p>
        <p style={{ opacity: '0.6', fontSize: '0.9rem' }}>
          Questions? Email us at <a href="mailto:casi@heycasi.com" style={{ color: '#5EEAD4', textDecoration: 'none' }}>casi@heycasi.com</a>
        </p>
        <p style={{ opacity: '0.5', fontSize: '0.8rem', margin: '1rem 0 0 0' }}>
          © 2025 Casi. Built with ❤️ for the streaming community.
        </p>
      </footer>
    </div>
  )
}