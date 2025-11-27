'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useScroll, useTransform, useMotionTemplate, useMotionValue } from 'framer-motion'
import { ArrowRight, BarChart3, Globe2, MessageSquare, ShieldCheck, Menu, X } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// --- Components ---

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b',
        scrolled
          ? 'bg-[#0B0D14]/80 backdrop-blur-md border-white/10 py-4'
          : 'bg-transparent border-transparent py-6'
      )}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-center relative">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/landing-logo.svg"
            alt="Casi Logo"
            width={180}
            height={72}
            className="w-auto h-16"
            priority
          />
        </Link>

        <div className="hidden md:flex items-center gap-8 absolute right-6">
          <Link
            href="#features"
            className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >
            Features
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="group relative inline-flex h-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-[#6932FF] to-[#932FFE] px-6 font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-[#6932FF]/50"
          >
            <span className="mr-2">Start Free</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden absolute top-full left-0 w-full bg-[#0B0D14]/95 backdrop-blur-md border-b border-white/10 p-6 flex flex-col gap-4"
        >
          <Link
            href="#features"
            className="text-lg font-medium text-zinc-400"
            onClick={() => setMobileMenuOpen(false)}
          >
            Features
          </Link>
          <Link
            href="/pricing"
            className="text-lg font-medium text-zinc-400"
            onClick={() => setMobileMenuOpen(false)}
          >
            Pricing
          </Link>
          <Link
            href="/login"
            className="text-lg font-medium text-zinc-400"
            onClick={() => setMobileMenuOpen(false)}
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="text-lg font-semibold text-[#5EEAD4]"
            onClick={() => setMobileMenuOpen(false)}
          >
            Start Free
          </Link>
        </motion.div>
      )}
    </nav>
  )
}

const Hero = () => {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 500], [0, 200])
  const y2 = useTransform(scrollY, [0, 500], [0, -150])

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    try {
      const { error } = await supabase.from('waitlist').insert([
        {
          email: email.toLowerCase().trim(),
          source: 'homepage_v2_redesign',
          created_at: new Date().toISOString(),
          user_agent: navigator.userAgent,
        },
      ])
      if (error && error.code !== '23505') throw error
      setStatus('success')
      setEmail('')
    } catch (e) {
      setStatus('error')
    }
  }

  return (
    <section className="relative min-h-screen flex flex-col justify-center items-center pt-32 pb-20 overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          style={{ y: y1 }}
          className="absolute top-20 -left-20 w-96 h-96 bg-[#6932FF]/20 rounded-full blur-[120px]"
        />
        <motion.div
          style={{ y: y2 }}
          className="absolute bottom-20 -right-20 w-[500px] h-[500px] bg-[#5EEAD4]/10 rounded-full blur-[120px]"
        />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]" />

        {/* Robot Background */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Image
            src="/landing-robot.png"
            alt=""
            width={850}
            height={850}
            className="w-[850px] h-auto object-contain opacity-[0.06] brightness-[0.7] animate-float-slow"
            priority
          />
        </div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-[#5EEAD4] mb-8 font-mono font-bold uppercase tracking-wide"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5EEAD4] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5EEAD4]"></span>
          </span>
          Multi-platform Live
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.2]"
        >
          <span className="bg-gradient-to-r from-[#6932FF] via-[#932FFE] to-[#5EEAD4] bg-clip-text text-transparent block mb-2 pb-3">
            Stop Ignoring
          </span>
          Your Best Viewers.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10"
        >
          The only real-time intelligence engine that instantly highlights VIPs, flags toxic
          messages, and detects viral moments so you never miss a sub or a clip.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col items-center gap-4"
        >
          <form onSubmit={handleJoin} className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 bg-white/5 border border-white/10 rounded-full px-6 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#6932FF] focus:ring-2 focus:ring-[#6932FF]/20 transition-all"
            />
            <button
              disabled={status === 'loading' || status === 'success'}
              className="bg-gradient-to-r from-[#6932FF] to-[#932FFE] text-white font-semibold rounded-full px-8 py-3 hover:shadow-lg hover:shadow-[#6932FF]/50 transition-all disabled:opacity-70"
            >
              {status === 'loading'
                ? 'Calculating...'
                : status === 'success'
                  ? '✓ Joined!'
                  : 'Get Your Stream Intelligence Score'}
            </button>
          </form>
          {status === 'success' && (
            <p className="text-[#5EEAD4] text-sm font-medium">
              🎉 You're on the list! Check your email.
            </p>
          )}
          {status === 'error' && (
            <p className="text-red-400 text-sm font-medium">
              Something went wrong. Please try again.
            </p>
          )}
          <p className="text-zinc-500 text-sm font-mono tracking-wide">NO CREDIT CARD REQUIRED</p>
        </motion.div>
      </div>

      {/* Dashboard Preview with 3D Tilt */}
      <motion.div
        initial={{ opacity: 0, y: 100, rotateX: 20 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.8, delay: 0.4, type: 'spring' }}
        className="relative z-10 mt-20 max-w-6xl mx-auto px-6"
      >
        <div className="relative rounded-2xl border border-white/10 bg-[#0B0D14]/50 backdrop-blur-xl shadow-2xl shadow-[#6932FF]/20 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D14] via-transparent to-transparent z-10" />
          <Image
            src="/wholedashboard.png"
            alt="Casi Dashboard"
            width={1400}
            height={900}
            className="w-full h-auto rounded-lg opacity-90 group-hover:opacity-100 transition-opacity duration-700"
            priority
          />
          {/* Floating UI Elements */}
          <div className="absolute -right-12 top-20 hidden lg:block p-4 bg-[#1a1a2e]/90 backdrop-blur border border-white/10 rounded-2xl shadow-xl animate-float-slow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 rounded-full bg-[#5EEAD4] animate-pulse" />
              <span className="text-xs font-mono text-[#5EEAD4] font-bold uppercase tracking-wide">
                LIVE ANALYSIS
              </span>
            </div>
            <div className="text-sm text-white font-medium">🔥 Sentiment Spike Detected</div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

const BentoCard = ({ title, description, icon: Icon, className, children }: any) => {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  return (
    <div
      className={cn(
        'group relative border border-white/10 bg-white/5 overflow-hidden rounded-2xl',
        className
      )}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(105, 50, 255, 0.15),
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative h-full p-6 flex flex-col">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6932FF]/20 to-[#932FFE]/20 text-[#932FFE]">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="mb-2 text-lg font-bold text-white tracking-tight">{title}</h3>
        <p className="text-sm text-zinc-400 mb-6">{description}</p>
        <div className="flex-1 mt-auto">{children}</div>
      </div>
    </div>
  )
}

const Features = () => {
  return (
    <section id="features" className="py-32 relative bg-[#0B0D14]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Built for Speed. Not Show.
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            While other tools waste time with AI prompts, Casi delivers instant intelligence you can
            act on. Zero BS. Pure performance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
          {/* Large Card 1 */}
          <BentoCard
            title="Instant Sentiment Detection"
            description="Zero-latency analysis. Faster than GPT-4 because we don't use it. Track mood shifts during gameplay, reactions, and events in real-time."
            icon={BarChart3}
            className="md:col-span-2 md:row-span-2 h-full min-h-[400px]"
          >
            <div className="relative h-full w-full rounded-2xl bg-[#1a1a2e]/50 border border-white/5 p-4 overflow-hidden">
              <Image
                src="/casigraphs.png"
                alt="Sentiment Analysis Graphs"
                width={600}
                height={300}
                className="w-full h-full object-cover opacity-90 rounded"
              />
              <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#0B0D14] to-transparent" />
            </div>
          </BentoCard>

          {/* Small Card 1 */}
          <BentoCard
            title="Global Translation"
            description="Break language barriers with 13+ supported languages. English, Spanish, French, German, and more."
            icon={Globe2}
            className="md:col-span-1"
          >
            <div className="flex flex-wrap gap-2 mt-2">
              {['🇺🇸', '🇪🇸', '🇫🇷', '🇩🇪', '🇯🇵', '🇰🇷'].map((flag) => (
                <span
                  key={flag}
                  className="px-3 py-1.5 bg-white/5 rounded-lg text-xl hover:bg-white/10 transition-colors cursor-default"
                >
                  {flag}
                </span>
              ))}
            </div>
          </BentoCard>

          {/* Small Card 2 */}
          <BentoCard
            title="VIP Tracking"
            description="Spot your whales instantly. Track high-value chatters, recurring supporters, and engagement spikes in real-time."
            icon={MessageSquare}
            className="md:col-span-1"
          >
            <div className="mt-2 space-y-2">
              <div className="bg-white/5 p-3 rounded-lg border-l-2 border-[#6932FF] text-xs text-zinc-300 hover:bg-white/10 transition-colors">
                <span className="text-[#6932FF] font-bold">@user:</span>{' '}
                <span>What specs do you use?</span>
              </div>
              <div className="bg-white/5 p-3 rounded-lg border-l-2 border-[#5EEAD4] text-xs text-zinc-300 hover:bg-white/10 transition-colors">
                <span className="text-[#5EEAD4] font-bold">@fan:</span>{' '}
                <span>When is the next stream?</span>
              </div>
            </div>
          </BentoCard>

          {/* Wide Card */}
          <BentoCard
            title="100% Privacy Focused"
            description="Zero data training. Your chat is never used to train AI models. Processed in real-time and discarded. OAuth secured."
            icon={ShieldCheck}
            className="md:col-span-3"
          >
            <div className="grid grid-cols-3 gap-4 mt-4 opacity-50">
              <div className="h-1.5 bg-[#5EEAD4] rounded-full animate-pulse" />
              <div className="h-1.5 bg-[#6932FF] rounded-full animate-pulse delay-75" />
              <div className="h-1.5 bg-[#932FFE] rounded-full animate-pulse delay-150" />
            </div>
          </BentoCard>
        </div>
      </div>
    </section>
  )
}

const TrustBadges = () => {
  return (
    <section className="py-12 border-y border-white/5 bg-[#0f1119]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="p-6 bg-white/5 border border-white/10 rounded-2xl"
          >
            <div className="text-[#5EEAD4] text-3xl font-bold mb-2 font-mono">&lt;1ms</div>
            <div className="text-white font-semibold mb-1">Zero-Latency Analysis</div>
            <div className="text-sm text-zinc-500">
              Faster than GPT-4. Local processing. No API delays.
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="p-6 bg-white/5 border border-white/10 rounded-2xl"
          >
            <div className="text-[#6932FF] text-3xl font-bold mb-2">🔒</div>
            <div className="text-white font-semibold mb-1">100% Privacy Focused</div>
            <div className="text-sm text-zinc-500">
              No chat data training. Your streams stay yours.
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-6 bg-white/5 border border-white/10 rounded-2xl"
          >
            <div className="text-[#932FFE] text-3xl font-bold mb-2 font-mono">99.9%</div>
            <div className="text-white font-semibold mb-1">Enterprise Uptime</div>
            <div className="text-sm text-zinc-500">Built on Vercel + Supabase. Always online.</div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

const Stats = () => {
  return (
    <section className="py-20 bg-[#0B0D14]">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {[
          { label: 'Languages', value: '13+' },
          { label: 'Viral Moments Detected', value: '10K+' },
          { label: 'Messages Processed', value: '1M+' },
          { label: 'Creator Time Saved', value: '∞' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <div className="text-4xl font-bold text-white mb-2 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
              {stat.value}
            </div>
            <div className="text-sm text-zinc-500 font-medium uppercase tracking-wide font-mono">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

const CTA = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B0D14] via-[#6932FF]/10 to-[#0B0D14]" />
      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
          Ready to level up?
        </h2>
        <p className="text-xl text-zinc-400 mb-10">
          Join the wave of data-driven creators building stronger communities today.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/signup"
            className="px-8 py-4 bg-gradient-to-r from-[#6932FF] to-[#932FFE] text-white rounded-full font-bold hover:shadow-lg hover:shadow-[#6932FF]/50 transition-all"
          >
            Start Free Now
          </Link>
          <Link
            href="/pricing"
            className="px-8 py-4 bg-transparent border-2 border-white/20 text-white rounded-full font-bold hover:bg-white/10 hover:border-white/40 transition-all"
          >
            View Pricing
          </Link>
        </div>
      </div>
    </section>
  )
}

const Footer = () => {
  return (
    <footer className="py-12 border-t border-white/10 bg-[#0B0D14]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <Image
              src="/landing-logo.svg"
              alt="Casi"
              width={120}
              height={48}
              className="opacity-80 w-auto h-12"
            />
            <span className="text-zinc-500 text-sm">© 2025 Casi Platform</span>
          </div>
          <div className="flex gap-8 text-sm text-zinc-500">
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <a href="mailto:casi@heycasi.com" className="hover:text-white transition-colors">
              Contact
            </a>
          </div>
        </div>

        {/* COPPA Disclaimer */}
        <div className="mt-8 pt-6 border-t border-white/5">
          <p className="text-xs text-zinc-600 text-center max-w-4xl mx-auto leading-relaxed">
            <strong>COPPA Disclaimer:</strong> HeyCasi is an analytics tool for broadcasters. We do
            not knowingly collect or profile PII of individuals under 13. All data is processed in
            aggregate. Not affiliated with Twitch, Kick, or YouTube.
          </p>
        </div>
      </div>
    </footer>
  )
}

// --- Main Page ---

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0B0D14] text-white selection:bg-[#6932FF] selection:text-white">
      <Navbar />
      <Hero />
      <TrustBadges />
      <Stats />
      <Features />
      <CTA />
      <Footer />
    </main>
  )
}
