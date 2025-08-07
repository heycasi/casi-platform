// Test API endpoint for generating sample stream reports

import { NextRequest, NextResponse } from 'next/server'
import { EmailService } from '../../../lib/email'
import { StreamReport } from '../../../types/analytics'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      )
    }

    // Generate mock report data
    const mockReport = generateMockReport()

    // Send report via email
    const emailSent = await EmailService.sendStreamReport(email, mockReport)

    if (emailSent) {
      return NextResponse.json({ 
        success: true, 
        message: 'Sample report sent successfully!',
        report: mockReport
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to send sample report email' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Test report generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateMockReport(): StreamReport {
  return {
    session: {
      id: 'test-session-123',
      channel_name: 'CasiStreamer',
      session_start: new Date('2025-07-31T19:00:00Z').toISOString(),
      session_end: new Date('2025-07-31T22:30:00Z').toISOString(),
      duration_minutes: 210,
      peak_viewer_count: 1247,
      streamer_email: 'test@heycasi.com',
      total_messages: 3456,
      unique_chatters: 234,
      report_generated: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    analytics: {
      total_messages: 3456,
      questions_count: 142,
      positive_messages: 2134,
      negative_messages: 234,
      neutral_messages: 1088,
      avg_sentiment_score: 0.68,
      languages_detected: {
        'english': 2890,
        'spanish': 324,
        'french': 156,
        'german': 86
      },
      topics_discussed: {
        'gameplay': 1234,
        'strategy': 567,
        'music': 345,
        'chat': 289,
        'technical': 123
      },
      most_active_chatters: [
        { username: 'GamerPro2024', message_count: 87, avg_sentiment: 0.8 },
        { username: 'StreamFan42', message_count: 73, avg_sentiment: 0.7 },
        { username: 'ChatMaster', message_count: 65, avg_sentiment: 0.6 },
        { username: 'ViewerOne', message_count: 54, avg_sentiment: 0.9 },
        { username: 'RegularWatcher', message_count: 48, avg_sentiment: 0.5 }
      ],
      engagement_peaks: [
        {
          timestamp: new Date('2025-07-31T20:15:00Z').toISOString(),
          message_count: 89,
          intensity: 0.92
        },
        {
          timestamp: new Date('2025-07-31T21:30:00Z').toISOString(),
          message_count: 76,
          intensity: 0.85
        },
        {
          timestamp: new Date('2025-07-31T22:00:00Z').toISOString(),
          message_count: 68,
          intensity: 0.78
        }
      ],
      motivational_insights: [
        "Your stream had amazing energy tonight! The community was incredibly engaged during the boss fight segment.",
        "Viewers loved the music choices - several mentioned it enhanced their viewing experience.",
        "The Q&A section generated high engagement with thoughtful questions from your community."
      ]
    },
    highlights: {
      bestMoments: [
        {
          timestamp: new Date('2025-07-31T20:15:00Z').toISOString(),
          description: 'Epic boss fight victory - chat went wild with 89 messages of excitement!',
          sentiment_score: 0.92
        },
        {
          timestamp: new Date('2025-07-31T21:30:00Z').toISOString(),
          description: 'Hilarious moment with chat interaction - 76 messages of laughter and joy',
          sentiment_score: 0.85
        },
        {
          timestamp: new Date('2025-07-31T22:00:00Z').toISOString(),
          description: 'Clutch play that had everyone cheering - 68 messages of pure hype',
          sentiment_score: 0.78
        }
      ],
      topQuestions: [
        {
          id: 'q1',
          username: 'CuriousViewer',
          message: 'What graphics settings are you using? The game looks amazing!',
          timestamp: new Date('2025-07-31T20:45:00Z').toISOString(),
          language: 'english',
          engagement_level: 'high' as const,
          sentiment_score: 0.7
        },
        {
          id: 'q2',
          username: 'NewPlayer123',
          message: 'Any tips for beginners trying this boss fight?',
          timestamp: new Date('2025-07-31T21:15:00Z').toISOString(),
          language: 'english',
          engagement_level: 'high' as const,
          sentiment_score: 0.6
        },
        {
          id: 'q3',
          username: 'MusicLover',
          message: 'What\'s the name of that background song? It\'s so good!',
          timestamp: new Date('2025-07-31T19:30:00Z').toISOString(),
          language: 'english',
          engagement_level: 'medium' as const,
          sentiment_score: 0.8
        },
        {
          id: 'q4',
          username: 'TechGeek',
          message: '¿Qué micrófono usas? La calidad de audio es excelente',
          timestamp: new Date('2025-07-31T20:00:00Z').toISOString(),
          language: 'spanish',
          engagement_level: 'medium' as const,
          sentiment_score: 0.9
        },
        {
          id: 'q5',
          username: 'StrategyFan',
          message: 'Will you do a speedrun attempt next stream?',
          timestamp: new Date('2025-07-31T21:45:00Z').toISOString(),
          language: 'english',
          engagement_level: 'high' as const,
          sentiment_score: 0.7
        }
      ],
      mostEngagedViewers: [
        { username: 'GamerPro2024', message_count: 87, avg_sentiment: 0.8 },
        { username: 'StreamFan42', message_count: 73, avg_sentiment: 0.7 },
        { username: 'ChatMaster', message_count: 65, avg_sentiment: 0.6 },
        { username: 'ViewerOne', message_count: 54, avg_sentiment: 0.9 },
        { username: 'RegularWatcher', message_count: 48, avg_sentiment: 0.5 }
      ],
      languageBreakdown: {
        'english': { count: 2890, percentage: 84 },
        'spanish': { count: 324, percentage: 9 },
        'french': { count: 156, percentage: 5 },
        'german': { count: 86, percentage: 2 }
      },
      topicInsights: [
        { topic: 'gameplay', count: 1234, sentiment: 0.75, example_messages: [] },
        { topic: 'strategy', count: 567, sentiment: 0.68, example_messages: [] },
        { topic: 'music', count: 345, sentiment: 0.82, example_messages: [] },
        { topic: 'chat', count: 289, sentiment: 0.71, example_messages: [] },
        { topic: 'technical', count: 123, sentiment: 0.45, example_messages: [] }
      ]
    },
    recommendations: {
      streamOptimization: [
        'Your 3.5-hour stream length is perfect for maintaining high engagement',
        'Peak viewer count of 1,247 suggests great discoverability - consider streaming at similar times'
      ],
      contentSuggestions: [
        'Boss fight segments generated the highest engagement - consider more challenging content',
        'Music selection was highly appreciated by viewers - maintain this quality',
        'Multilingual audience (4 languages) suggests broader appeal - occasional acknowledgments could boost engagement'
      ],
      engagementTips: [
        'High question rate (142 questions) shows active community - consider dedicated Q&A segments',
        'Excellent positive sentiment (68%) indicates content resonates well with audience',
        '4 different languages detected - acknowledging international viewers occasionally could increase loyalty'
      ]
    },
    metadata: {
      generated_at: new Date().toISOString(),
      report_version: '1.0',
      processing_time_ms: 245
    }
  }
}