'use client'
import Link from 'next/link'
import DashboardMock from '../../components/DashboardMock'
import QuestionQueueMock from '../../components/QuestionQueueMock'

export default function DashboardPreviewPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 text-gray-900">
            Dashboard <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Preview</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
            Preview of the live dashboard. Join the beta to get access to real-time analytics.
          </p>
          <div className="inline-flex items-center bg-blue-50 text-blue-800 px-4 py-2 rounded-full text-sm font-medium border border-blue-200">
            🔒 This is a preview with synthetic data
          </div>
        </div>
      </section>

      {/* Dashboard Mockups */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">

          {/* Sentiment Dashboard */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Real-time Sentiment Analysis
              </h2>
              <p className="text-lg text-gray-600">
                Watch your chat's mood change live during your stream
              </p>
            </div>

            <div className="relative max-w-4xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg transform rotate-1"></div>
              <div className="relative bg-white rounded-lg overflow-hidden shadow-2xl">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Live Stream Analytics</h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-600">Live</span>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <DashboardMock variant="sentiment" />
                </div>
              </div>
            </div>
          </div>

          {/* Question Queue */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Question Detection & Alerts
              </h2>
              <p className="text-lg text-gray-600">
                Never miss important questions from your viewers
              </p>
            </div>

            <div className="relative max-w-4xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-400 rounded-lg transform -rotate-1"></div>
              <div className="relative bg-white rounded-lg overflow-hidden shadow-2xl">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Question Queue</h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-600">4 Pending</span>
                    </div>
                  </div>
                </div>
                <QuestionQueueMock variant="chat" />
              </div>
            </div>
          </div>

          {/* Complete Dashboard */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Complete Dashboard View
              </h2>
              <p className="text-lg text-gray-600">
                Full overview of all your streaming analytics in one place
              </p>
            </div>

            <div className="relative max-w-6xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg transform rotate-0.5"></div>
              <div className="relative bg-white rounded-lg overflow-hidden shadow-2xl">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Casi Analytics Dashboard</h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-600">Connected</span>
                    </div>
                  </div>
                </div>
                <DashboardMock variant="full" />
              </div>
            </div>
          </div>

          {/* Additional Features Preview */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-gray-50 rounded-xl border border-gray-200">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                📊
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Analytics Dashboard</h3>
              <p className="text-gray-600 text-sm">
                Comprehensive view of all your stream analytics in one place
              </p>
            </div>

            <div className="text-center p-8 bg-gray-50 rounded-xl border border-gray-200">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                🔔
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Smart Alerts</h3>
              <p className="text-gray-600 text-sm">
                Get notified when sentiment drops or important questions arise
              </p>
            </div>

            <div className="text-center p-8 bg-gray-50 rounded-xl border border-gray-200">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                📈
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Historical Trends</h3>
              <p className="text-gray-600 text-sm">
                Track your engagement patterns over time to improve your content
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
            Ready to access the real dashboard?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join our beta program to get full access to these features with your real stream data.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/beta"
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-12 py-4 rounded-full font-bold text-xl hover:opacity-90 transition-opacity inline-block"
              data-event="cta-dashboard-preview-join-beta"
            >
              Join Beta Program
            </Link>
            <Link
              href="/features"
              className="bg-white text-gray-900 px-12 py-4 rounded-full font-medium border-2 border-gray-200 hover:border-gray-300 transition-colors inline-block"
              data-event="cta-dashboard-preview-view-features"
            >
              View All Features
            </Link>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              💡 This preview uses anonymized synthetic data. Real dashboard shows your actual stream analytics.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}