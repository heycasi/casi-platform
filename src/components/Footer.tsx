'use client'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Casi */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-900">Casi</h4>
            <div className="flex items-center space-x-2 mb-4">
              <img src="/landing-logo.png" alt="Casi" className="h-6 w-auto" />
              <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Casi
              </span>
            </div>
            <p className="text-gray-600 text-sm">
              Your stream's brainy co-pilot. AI-powered chat analysis for better audience
              engagement.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-900">Product</h4>
            <div className="space-y-2">
              <Link href="/" className="block text-gray-600 hover:text-gray-900 text-sm">
                Home
              </Link>
              <Link href="/features" className="block text-gray-600 hover:text-gray-900 text-sm">
                Features
              </Link>
              <Link href="/pricing" className="block text-gray-600 hover:text-gray-900 text-sm">
                Pricing
              </Link>
              <Link href="/beta" className="block text-gray-600 hover:text-gray-900 text-sm">
                Beta
              </Link>
              <Link
                href="/dashboard-preview"
                className="block text-gray-600 hover:text-gray-900 text-sm"
              >
                Dashboard Preview
              </Link>
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-900">Company</h4>
            <div className="space-y-2">
              <Link href="/about" className="block text-gray-600 hover:text-gray-900 text-sm">
                About
              </Link>
              <Link href="/community" className="block text-gray-600 hover:text-gray-900 text-sm">
                Community
              </Link>
              <Link href="/contact" className="block text-gray-600 hover:text-gray-900 text-sm">
                Contact
              </Link>
              <a
                href="mailto:casi@heycasi.com"
                className="block text-gray-600 hover:text-gray-900 text-sm"
              >
                casi@heycasi.com
              </a>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-900">Legal</h4>
            <div className="space-y-2">
              <Link href="/privacy" className="block text-gray-600 hover:text-gray-900 text-sm">
                Privacy Policy
              </Link>
              <Link href="/terms" className="block text-gray-600 hover:text-gray-900 text-sm">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8 text-center">
          <p className="text-gray-600 text-sm">© 2024 Casi. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
