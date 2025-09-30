'use client'
import Link from 'next/link'

export default function CommunityPage() {
  const socialLinks = [
    {
      name: 'Discord',
      description: 'Join our Discord community for real-time support, feature discussions, and connecting with other streamers',
      icon: '💬',
      url: 'https://discord.gg/casi',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      buttonColor: 'bg-indigo-600 hover:bg-indigo-700'
    },
    {
      name: 'TikTok',
      description: 'Follow us for quick tips, feature highlights, and behind-the-scenes content',
      icon: '🎵',
      url: 'https://tiktok.com/@heycasi',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-600',
      buttonColor: 'bg-pink-600 hover:bg-pink-700'
    },
    {
      name: 'Twitter/X',
      description: 'Get the latest updates, announcements, and engage in conversations about streaming',
      icon: '🐦',
      url: 'https://twitter.com/heycasi',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      buttonColor: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      name: 'LinkedIn',
      description: 'Connect with us professionally and follow our company updates and milestones',
      icon: '💼',
      url: 'https://linkedin.com/company/heycasi',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      buttonColor: 'bg-blue-700 hover:bg-blue-800'
    }
  ]

  return (
    <>
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 text-gray-900">
            Join the <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Community</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
            Follow builds, drops, and behind-the-scenes content across our social platforms.
          </p>
        </div>
      </section>

      {/* Social Links */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {socialLinks.map((social, index) => (
              <div key={index} className={`${social.bgColor} rounded-2xl p-8 border-2 border-gray-100 hover:border-gray-200 transition-colors`}>
                <div className="flex items-start">
                  <div className="text-4xl mr-6 mt-1">{social.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{social.name}</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {social.description}
                    </p>
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center px-6 py-3 rounded-lg font-semibold text-white transition-colors ${social.buttonColor}`}
                      data-event={`cta-community-${social.name.toLowerCase()}`}
                    >
                      Follow on {social.name}
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Guidelines */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Community Guidelines
            </h2>
            <p className="text-xl text-gray-600">How we keep our community awesome</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white text-xl font-bold mb-4">
                ✅
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">What We Encourage</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Sharing streaming tips and experiences
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Constructive feedback on features
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Helping other streamers succeed
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Respectful discussions about analytics
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center text-white text-xl font-bold mb-4">
                ❌
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">Keep It Clean</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  No spam or self-promotion without context
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  No harassment or toxic behavior
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  No sharing of competitor links or products
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  No off-topic discussions in focused channels
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Beta Community */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
            Beta Community Perks
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Beta users get exclusive access to our private Discord channels and direct line to our development team.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                🔐
              </div>
              <h3 className="text-lg font-bold mb-2 text-gray-900">Private Channels</h3>
              <p className="text-gray-600 text-sm">
                Exclusive Discord channels for beta testers only
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                💬
              </div>
              <h3 className="text-lg font-bold mb-2 text-gray-900">Direct Feedback</h3>
              <p className="text-gray-600 text-sm">
                Talk directly with our dev team about features
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                🚀
              </div>
              <h3 className="text-lg font-bold mb-2 text-gray-900">Early Access</h3>
              <p className="text-gray-600 text-sm">
                First to see and test new features before release
              </p>
            </div>
          </div>

          <Link
            href="/beta"
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-12 py-4 rounded-full font-bold text-xl hover:opacity-90 transition-opacity inline-block"
            data-event="cta-community-join-beta"
          >
            Join Beta Community
          </Link>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
            Need to reach out directly?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            For business inquiries, partnerships, or urgent support issues.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:casi@heycasi.com"
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity inline-flex items-center justify-center"
              data-event="cta-community-email"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              casi@heycasi.com
            </a>
            <Link
              href="/contact"
              className="bg-white text-gray-900 px-8 py-3 rounded-lg font-medium border-2 border-gray-200 hover:border-gray-300 transition-colors inline-flex items-center justify-center"
              data-event="cta-community-contact-form"
            >
              Contact Form
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}