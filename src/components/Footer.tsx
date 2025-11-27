'use client'
import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
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
            <Link href="/features" className="hover:text-white transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="/about" className="hover:text-white transition-colors">
              About
            </Link>
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
