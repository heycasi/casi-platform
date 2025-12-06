'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useScroll, useTransform, useMotionTemplate, useMotionValue } from 'framer-motion'
import { ArrowRight, BarChart3, Globe2, MessageSquare, ShieldCheck, Menu, X } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import Footer from '@/components/Footer'
import BookDemoModal from '@/components/BookDemoModal'

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
            href="/features"
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
            href="/login-email"
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
            href="/features"
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
            href="/login-email"
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
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 500], [0, 200])
  const y2 = useTransform(scrollY, [0, 500], [0, -150])

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
          className="text-5xl md:text-7xl font-bold font-heading tracking-tight text-white mb-6 leading-[1.2]"
        >
          <span className="bg-gradient-to-r from-[#6932FF] via-[#932FFE] to-[#5EEAD4] bg-clip-text text-transparent block mb-2 pb-3">
            Twitch Delivers the Chat.
          </span>
          Casi Decodes It.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10"
        >
          Reduce your mental load. While you broadcast, Casi acts as your Intelligence
          Officer—flagging questions, tracking the 'vibe,' and marking clip moments automatically.
          Don't just read chat; understand it.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col items-center gap-4"
        >
          <Link
            href="/signup"
            className="bg-gradient-to-r from-[#6932FF] to-[#932FFE] text-white font-semibold rounded-full px-8 py-4 text-lg hover:shadow-lg hover:shadow-[#6932FF]/50 transition-all"
          >
            Analyze My Chat Free
          </Link>
          <div className="flex items-center gap-2 text-zinc-500 text-xs font-medium bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
            <ShieldCheck className="w-3 h-3 text-[#5EEAD4]" />
            <span>100% Compliant Support Layer. We make your mods smarter, not obsolete.</span>
          </div>
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
            src="/images/dashboard-hero.jpg"
            alt="HeyCasi Command Center Dashboard"
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
        <h3 className="mb-2 text-lg font-bold font-heading text-white tracking-tight">{title}</h3>
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
          <h2 className="text-3xl md:text-5xl font-bold font-heading text-white mb-4 tracking-tight">
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
                src="/images/feature-chat.jpg"
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
            <div className="mt-2 relative h-full min-h-[150px] w-full rounded-lg overflow-hidden bg-white/5 border border-white/5">
              <Image
                src="/images/feature-vip.jpg"
                alt="VIP Tracking Interface"
                fill
                className="object-cover opacity-90"
              />
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

const AgencySection = () => {
  const [showBookDemo, setShowBookDemo] = useState(false)

  return (
    <>
      <BookDemoModal isOpen={showBookDemo} onClose={() => setShowBookDemo(false)} />
      <section className="py-32 relative overflow-hidden border-y border-white/5">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0D14] via-[#1a0f2e] to-[#0B0D14]" />

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          {/* Hook Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <p className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-zinc-500">
              SCALABLE INFRASTRUCTURE FOR MODERN TALENT AGENCIES
            </p>
          </motion.div>

          {/* Headline Block */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-6xl font-bold font-heading text-white mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-[#6932FF] via-[#932FFE] to-[#5EEAD4] bg-clip-text text-transparent">
                Unified Roster Intelligence
              </span>
            </h2>
            <p className="text-lg md:text-xl text-zinc-400 max-w-3xl mx-auto mb-10 leading-relaxed">
              The spreadsheet era is over. Casi provides a single, secure Command Center to monitor
              performance, manage permissions, and streamline reporting across your entire talent
              portfolio—whether you manage 5 creators or 500.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="group px-8 py-4 bg-gradient-to-r from-[#6932FF] to-[#932FFE] text-white rounded-full font-bold hover:shadow-lg hover:shadow-[#6932FF]/50 transition-all inline-flex items-center justify-center gap-2"
              >
                Explore Agency Solutions
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <button
                onClick={() => setShowBookDemo(true)}
                className="px-8 py-4 bg-transparent border-2 border-white/20 text-white rounded-full font-bold hover:bg-white/10 hover:border-white/40 transition-all"
              >
                Book a Demo
              </button>
            </div>
          </motion.div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Portfolio-Wide Visibility */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="group relative bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all duration-300"
            >
              {/* Icon */}
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20">
                <svg
                  className="w-7 h-7 text-purple-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>

              <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
                Portfolio-Wide Visibility
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Gain a bird's-eye view of your entire roster's performance in real-time. Aggregate
                data across 5, 50, or 500 creators to identify macro trends, spot breakout talent,
                and report to stakeholders with zero friction.
              </p>

              {/* Hover effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-600/0 to-purple-600/0 group-hover:from-purple-600/5 group-hover:to-transparent transition-all duration-300 pointer-events-none" />
            </motion.div>

            {/* Granular Team Permissions */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="group relative bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all duration-300"
            >
              {/* Icon */}
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20">
                <svg
                  className="w-7 h-7 text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                  />
                </svg>
              </div>

              <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
                Granular Team Permissions
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Built for the modern agency structure. Assign specific roster managers to specific
                talent pods. Ensure your team sees exactly what they need to see—nothing more,
                nothing less—with enterprise-grade seat management.
              </p>

              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-600/0 to-emerald-600/0 group-hover:from-emerald-600/5 group-hover:to-transparent transition-all duration-300 pointer-events-none" />
            </motion.div>

            {/* Automated Partner Reporting */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="group relative bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all duration-300"
            >
              {/* Icon */}
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20">
                <svg
                  className="w-7 h-7 text-amber-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 3L15.75 5.25M13.5 3l3.5 3.5"
                  />
                </svg>
              </div>

              <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
                Automated Partner Reporting
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Your brand partners demand data. Give it to them faster. Generate white-labeled,
                agency-branded PDF reports for campaign sponsorships across your entire roster with
                a single click.
              </p>

              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-600/0 to-amber-600/0 group-hover:from-amber-600/5 group-hover:to-transparent transition-all duration-300 pointer-events-none" />
            </motion.div>
          </div>

          {/* Campaign Intelligence Introduction */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="mb-20"
          >
            <div className="max-w-4xl mx-auto text-center">
              <h3 className="text-3xl md:text-4xl font-bold font-heading text-white mb-4">
                Prove Your Roster's Value with Campaign Intelligence
              </h3>
              <p className="text-lg text-zinc-400 leading-relaxed">
                Move beyond basic view counts. Track aggregated deliverables across your entire
                talent portfolio and benchmark specific campaigns against historical performance in
                real-time.
              </p>
            </div>
          </motion.div>

          {/* Section 1: The Macro View (Text Left, Image Right) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7 }}
            className="mb-32"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Text Content */}
              <div className="order-2 lg:order-1">
                <h3 className="text-3xl md:text-4xl font-bold font-heading text-white mb-6">
                  The Agency Command Center
                </h3>
                <p className="text-lg text-zinc-400 leading-relaxed mb-8">
                  Stop aggregating data manually. Get a real-time pulse on your entire organization
                  with unified metrics. Monitor total deliverables, aggregated viewership, and
                  active campaign benchmarks from a single pane of glass.
                </p>

                {/* Key Features */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mt-1">
                      <svg
                        className="w-3 h-3 text-purple-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-semibold mb-1">Portfolio Aggregation</p>
                      <p className="text-sm text-zinc-500">
                        Instantly visualize total reach, engagement volume, and average viewership
                        across all active talent slots.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mt-1">
                      <svg
                        className="w-3 h-3 text-emerald-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-semibold mb-1">Sponsorship Benchmarking</p>
                      <p className="text-sm text-zinc-500">
                        Compare live campaign metrics against previous quarterly baselines to prove
                        ROI to clients.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mt-1">
                      <svg
                        className="w-3 h-3 text-amber-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-semibold mb-1">Automated Reporting</p>
                      <p className="text-sm text-zinc-500">
                        Turn raw data into client-ready sponsor reports with a single click.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Image */}
              <div className="order-1 lg:order-2">
                <div className="relative rounded-2xl border border-white/20 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl shadow-2xl shadow-purple-900/20 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D14] via-transparent to-transparent z-10 pointer-events-none" />
                  <div className="relative">
                    <Image
                      src="/agencydashboard top.png"
                      alt="Agency Command Center - Campaign Intelligence Dashboard"
                      width={1400}
                      height={400}
                      className="w-full h-auto opacity-90"
                      priority
                    />
                  </div>
                </div>
                <p className="text-xs text-zinc-500 italic mt-3 text-center">
                  Automated benchmarking tracks campaign health against quarterly goals.
                  <br />
                  Illustrative dashboard view. Campaign data and benchmarks are customizable per
                  client.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Section 2: The Micro View (Image Left, Text Right) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
            className="mb-20"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Image */}
              <div className="order-1">
                <div
                  className="relative rounded-2xl border border-white/20 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl shadow-2xl shadow-purple-900/20 overflow-hidden group"
                  style={{ perspective: '2000px' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D14] via-transparent to-transparent z-10 pointer-events-none" />
                  <div className="relative aspect-video">
                    <Image
                      src="/agencydashboard.png"
                      alt="Granular Roster Management - Individual Creator View"
                      fill
                      className="object-cover object-top opacity-90 group-hover:opacity-100 transition-opacity duration-700"
                      priority
                    />
                  </div>

                  {/* Floating metric badge */}
                  <div className="absolute top-6 right-6 z-20 px-4 py-3 bg-[#1a1a2e]/90 backdrop-blur-xl border border-white/20 rounded-xl shadow-xl hidden lg:block">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-mono text-emerald-300 font-bold uppercase tracking-wide">
                        LIVE STATUS
                      </span>
                    </div>
                    <div className="text-xl font-bold text-white">5 Active</div>
                    <div className="text-xs text-zinc-400 mt-0.5">Creators streaming</div>
                  </div>
                </div>
                <p className="text-xs text-zinc-500 italic mt-3 text-center">
                  Live status indicators and 'Health Scores' update in real-time.
                </p>
              </div>

              {/* Text Content */}
              <div className="order-2">
                <h3 className="text-3xl md:text-4xl font-bold font-heading text-white mb-6">
                  Granular Roster Management
                </h3>
                <p className="text-lg text-zinc-400 leading-relaxed mb-8">
                  Drill down from the portfolio level to the individual creator in one click.
                  Instantly see who is live, check health scores, and manage team permissions.
                  Whether you have 5 talent or 50, keep your roster organized and your operations
                  distinct.
                </p>

                {/* Key Features */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mt-1">
                      <svg
                        className="w-3 h-3 text-purple-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-semibold mb-1">
                        Individual Performance Tracking
                      </p>
                      <p className="text-sm text-zinc-500">
                        View detailed analytics for each creator including stream history, viewer
                        metrics, and engagement trends.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mt-1">
                      <svg
                        className="w-3 h-3 text-emerald-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-semibold mb-1">Health Score Monitoring</p>
                      <p className="text-sm text-zinc-500">
                        Automated alerts for sentiment shifts, viewer drops, and toxicity spikes to
                        protect your talent and brand partnerships.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mt-1">
                      <svg
                        className="w-3 h-3 text-blue-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-semibold mb-1">One-Click Dashboard Access</p>
                      <p className="text-sm text-zinc-500">
                        Jump directly into any creator's full analytics dashboard with agency admin
                        privileges—no separate logins required.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}

const CTA = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B0D14] via-[#6932FF]/10 to-[#0B0D14]" />
      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold font-heading text-white mb-6 tracking-tight">
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

// --- Main Page ---

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0B0D14] text-white selection:bg-[#6932FF] selection:text-white">
      <Navbar />
      <Hero />
      <TrustBadges />
      <Stats />
      <Features />
      <AgencySection />
      <CTA />
      <Footer />
    </main>
  )
}
