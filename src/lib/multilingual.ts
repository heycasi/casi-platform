// src/lib/multilingual.ts - Enhanced Multilingual Support with Detailed Sentiment Analysis

import { getGamingSentiment } from './gaming-dictionary'

export interface LanguageDetection {
  // language removed from UI surface; kept internal-only if needed
  language?: string
  confidence?: number
  isQuestion: boolean
  sentiment: 'positive' | 'negative' | 'neutral'
  sentimentReason?: string
  sentimentScore: number
  topics?: string[]
  engagementLevel: 'high' | 'medium' | 'low'
  questionType?: string
}

// Enhanced positive words by language (expanded lists)
const positiveWords: { [key: string]: string[] } = {
  english: [
    'awesome',
    'amazing',
    'great',
    'excellent',
    'fantastic',
    'wonderful',
    'incredible',
    'outstanding',
    'brilliant',
    'perfect',
    'superb',
    'magnificent',
    'spectacular',
    'phenomenal',
    'marvelous',
    'love',
    'adore',
    'enjoy',
    'like',
    'appreciate',
    'cherish',
    'treasure',
    'fun',
    'exciting',
    'thrilling',
    'entertaining',
    'engaging',
    'captivating',
    'fascinating',
    'cool',
    'sweet',
    'nice',
    'good',
    'solid',
    'dope',
    'fire',
    'lit',
    'sick',
    'beast',
    'insane',
    'wow',
    'omg',
    'poggers',
    'pog',
    'pogchamp',
    'hype',
    'hyped',
    'epic',
    'legendary',
    'congratulations',
    'congrats',
    'well done',
    'good job',
    'nice work',
    'impressive',
    'beautiful',
    'gorgeous',
    'stunning',
    'pretty',
    'cute',
    'adorable',
    'funny',
    'hilarious',
    'lol',
    'lmao',
    'rofl',
    'comedy',
    'genius',
    'skilled',
    'talented',
    'gifted',
    'pro',
    'professional',
    'expert',
    'master',
    'clutch',
    'clean',
    'smooth',
    'flawless',
    'godlike',
    'cracked',
    'nuts',
  ],
  spanish: [
    'increíble',
    'asombroso',
    'genial',
    'excelente',
    'fantástico',
    'maravilloso',
    'perfecto',
    'me encanta',
    'amo',
    'adoro',
    'disfruto',
    'divertido',
    'emocionante',
    'bueno',
    'muy bien',
    'felicidades',
    'enhorabuena',
    'hermoso',
    'precioso',
    'gracioso',
    'talentoso',
    'crack',
    'bestial',
  ],
  french: [
    'incroyable',
    'génial',
    'excellent',
    'fantastique',
    'merveilleux',
    'parfait',
    'magnifique',
    "j'adore",
    "j'aime",
    'amusant',
    'passionnant',
    'bon',
    'très bien',
    'félicitations',
    'beau',
    'joli',
    'drôle',
    'talentueux',
    'impressionnant',
    'fou',
    'ouf',
  ],
  german: [
    'unglaublich',
    'erstaunlich',
    'toll',
    'exzellent',
    'fantastisch',
    'wunderbar',
    'perfekt',
    'liebe',
    'mag',
    'spaß',
    'aufregend',
    'gut',
    'sehr gut',
    'glückwunsch',
    'schön',
    'lustig',
    'talentiert',
    'beeindruckend',
    'krass',
    'geil',
    'hammer',
  ],
  portuguese: [
    'incrível',
    'incrivel',
    'fantástico',
    'fantastico',
    'maravilhoso',
    'perfeito',
    'ótimo',
    'otimo',
    'amo',
    'adoro',
    'gosto',
    'divertido',
    'emocionante',
    'bom',
    'muito bom',
    'parabéns',
    'parabens',
    'lindo',
    'bonito',
    'engraçado',
    'engraçado',
    'talentoso',
    'impressionante',
    'demais',
    'top',
  ],
  italian: [
    'incredibile',
    'fantastico',
    'meraviglioso',
    'perfetto',
    'eccellente',
    'magnifico',
    'amo',
    'adoro',
    'mi piace',
    'divertente',
    'emozionante',
    'buono',
    'molto bene',
    'congratulazioni',
    'bello',
    'carino',
    'divertente',
    'talentuoso',
    'impressionante',
    'pazzesco',
  ],
}

// Enhanced negative words by language
const negativeWords: { [key: string]: string[] } = {
  english: [
    'awful',
    'terrible',
    'horrible',
    'bad',
    'worst',
    'hate',
    'sucks',
    'boring',
    'annoying',
    'frustrating',
    'disappointing',
    'sad',
    'angry',
    'mad',
    'upset',
    'confused',
    'lost',
    'lag',
    'lagging',
    'laggy',
    'slow',
    'broken',
    'bug',
    'glitch',
    'error',
    'fail',
    'failing',
    'trash',
    'garbage',
    'noob',
    'newb',
    'cringe',
    'yikes',
    'oof',
    'rip',
    'dead',
    'died',
  ],
  spanish: [
    'horrible',
    'terrible',
    'malo',
    'odio',
    'aburrido',
    'molesto',
    'frustrante',
    'triste',
    'enojado',
    'confundido',
    'lag',
    'lento',
    'roto',
    'error',
    'fallo',
    'basura',
    'noob',
  ],
  french: [
    'horrible',
    'terrible',
    'mauvais',
    'déteste',
    'ennuyeux',
    'agaçant',
    'frustrant',
    'triste',
    'en colère',
    'confus',
    'lag',
    'lent',
    'cassé',
    'erreur',
    'échec',
    'nul',
    'noob',
  ],
  german: [
    'schrecklich',
    'furchtbar',
    'schlecht',
    'hasse',
    'langweilig',
    'nervig',
    'frustrierend',
    'traurig',
    'wütend',
    'verwirrt',
    'lag',
    'langsam',
    'kaputt',
    'fehler',
    'versagen',
    'müll',
  ],
  portuguese: [
    'horrível',
    'terrível',
    'ruim',
    'odeio',
    'chato',
    'irritante',
    'frustrante',
    'triste',
    'bravo',
    'confuso',
    'lag',
    'lento',
    'quebrado',
    'erro',
    'falha',
    'lixo',
    'noob',
  ],
  italian: [
    'orribile',
    'terribile',
    'cattivo',
    'odio',
    'noioso',
    'fastidioso',
    'frustrante',
    'triste',
    'arrabbiato',
    'confuso',
    'lag',
    'lento',
    'rotto',
    'errore',
    'fallimento',
    'spazzatura',
  ],
}

// Question words by language (more precise lists)
const questionWords: { [key: string]: string[] } = {
  english: [
    'what',
    'how',
    'when',
    'where',
    'why',
    'who',
    'which',
    'can you',
    'could you',
    'would you',
    'should i',
    'will you',
    'do you',
    'does',
    'did you',
    'is there',
    'are there',
    'was there',
    'were there',
  ],
  spanish: [
    'qué',
    'que',
    'cómo',
    'como',
    'cuándo',
    'cuando',
    'dónde',
    'donde',
    'por qué',
    'por que',
    'porqué',
    'porque',
    'quién',
    'quien',
    'cuál',
    'cual',
    'puedes',
    'puedo',
  ],
  french: [
    'quoi',
    'que',
    'comment',
    'quand',
    'où',
    'ou',
    'pourquoi',
    'qui',
    'quel',
    'quelle',
    'peux',
    'peut',
    'pouvez',
  ],
  german: [
    'was',
    'wie',
    'wann',
    'wo',
    'warum',
    'wer',
    'welche',
    'welcher',
    'können',
    'kann',
    'könntest',
  ],
  portuguese: [
    'o que',
    'oque',
    'como',
    'quando',
    'onde',
    'por que',
    'porque',
    'quem',
    'qual',
    'pode',
    'posso',
  ],
  italian: [
    'cosa',
    'come',
    'quando',
    'dove',
    'perché',
    'perche',
    'chi',
    'quale',
    'puoi',
    'posso',
    'può',
  ],
  dutch: ['wat', 'hoe', 'wanneer', 'waar', 'waarom', 'wie', 'welke', 'kun', 'kan', 'zou'],
  japanese: ['何', 'なに', 'なん', 'どう', 'いつ', 'どこ', 'なぜ', 'だれ', 'どれ', 'できる'],
  korean: ['뭐', '무엇', '어떻게', '언제', '어디', '왜', '누구', '어느', '할 수 있어'],
  chinese: ['什么', '怎么', '什么时候', '哪里', '为什么', '谁', '哪个', '可以', '能'],
  russian: ['что', 'как', 'когда', 'где', 'почему', 'кто', 'какой', 'можешь', 'могу'],
  arabic: ['ما', 'كيف', 'متى', 'أين', 'لماذا', 'من', 'أي', 'يمكن', 'هل'],
  hindi: ['क्या', 'कैसे', 'कब', 'कहाँ', 'क्यों', 'कौन', 'कौन सा', 'कर सकते'],
}

// Topic detection keywords
const topicKeywords: { [key: string]: string[] } = {
  gaming: [
    'game',
    'play',
    'level',
    'boss',
    'skill',
    'build',
    'strategy',
    'win',
    'lose',
    'pvp',
    'pve',
    'raid',
    'quest',
    'achievement',
  ],
  technical: [
    'setup',
    'pc',
    'specs',
    'fps',
    'resolution',
    'settings',
    'hardware',
    'software',
    'lag',
    'ping',
    'internet',
  ],
  personal: [
    'life',
    'work',
    'family',
    'story',
    'experience',
    'opinion',
    'feel',
    'think',
    'believe',
  ],
  content: [
    'stream',
    'video',
    'youtube',
    'twitch',
    'content',
    'upload',
    'edit',
    'thumbnail',
    'title',
  ],
  music: ['song', 'music', 'artist', 'album', 'playlist', 'beat', 'remix', 'genre', 'lyrics'],
}

// Engagement level indicators
const highEngagementWords = [
  'poggers',
  'pog',
  'pogchamp',
  'hype',
  'hyped',
  'lit',
  'fire',
  'insane',
  'nuts',
  'cracked',
  'clutch',
  'epic',
  'legendary',
  'godlike',
  'beast',
  'sick',
  'dope',
  'wow',
  'omg',
  'holy',
  'amazing',
  'incredible',
  'unreal',
  'no way',
  'cant believe',
  'mind blown',
]

// Detect language based on character patterns and common words
export function detectLanguage(text: string): { language: string; confidence: number } {
  const cleanText = text.toLowerCase().replace(/[^\w\s]/g, ' ')
  const words = cleanText.split(/\s+/).filter((word) => word.length > 1)

  if (words.length === 0) return { language: 'english', confidence: 0.5 }

  const scores: { [key: string]: number } = {}

  // Check for language-specific patterns
  Object.keys(questionWords).forEach((lang) => {
    scores[lang] = 0

    // Check question words
    questionWords[lang].forEach((qWord) => {
      if (cleanText.includes(qWord)) {
        scores[lang] += 2
      }
    })

    // Check positive words
    if (positiveWords[lang]) {
      positiveWords[lang].forEach((pWord) => {
        if (cleanText.includes(pWord)) {
          scores[lang] += 1
        }
      })
    }

    // Check negative words
    if (negativeWords[lang]) {
      negativeWords[lang].forEach((nWord) => {
        if (cleanText.includes(nWord)) {
          scores[lang] += 1
        }
      })
    }
  })

  // Character-based detection for non-Latin scripts
  if (/[\u4e00-\u9fff]/.test(text)) scores.chinese = (scores.chinese || 0) + 3
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) scores.japanese = (scores.japanese || 0) + 3
  if (/[\uac00-\ud7af]/.test(text)) scores.korean = (scores.korean || 0) + 3
  if (/[\u0600-\u06ff]/.test(text)) scores.arabic = (scores.arabic || 0) + 3
  if (/[\u0900-\u097f]/.test(text)) scores.hindi = (scores.hindi || 0) + 3
  if (/[\u0400-\u04ff]/.test(text)) scores.russian = (scores.russian || 0) + 3

  // Find the language with highest score
  const maxScore = Math.max(...Object.values(scores))
  const detectedLang = Object.keys(scores).find((lang) => scores[lang] === maxScore) || 'english'

  // Calculate confidence based on score relative to text length
  const confidence = Math.min(0.9, Math.max(0.3, maxScore / Math.max(words.length, 1)))

  return { language: detectedLang, confidence }
}

// Enhanced sentiment analysis with detailed reasoning
export function analyzeSentiment(
  text: string,
  language: string,
  tier?: 'Starter' | 'Pro' | 'Agency'
): {
  sentiment: 'positive' | 'negative' | 'neutral'
  score: number
  reason?: string
} {
  const lowerText = text.toLowerCase()
  let score = 0
  let reasons: string[] = []

  // PRIORITY 1: Check gaming slang FIRST (Pro+ tier only)
  // Gaming slang dictionary is a Pro+ feature
  const hasGamingDictionary = tier === 'Pro' || tier === 'Agency'

  if (hasGamingDictionary) {
    // Split message into words and check each one
    const words = lowerText.split(/\s+/)
    for (const word of words) {
      const gamingScore = getGamingSentiment(word)
      if (gamingScore !== null) {
        // Gaming slang detected - use this score immediately and return
        score = gamingScore
        reasons.push(`gaming slang: "${word}" (${gamingScore > 0 ? 'positive' : 'negative'})`)

        // Return immediately - gaming slang takes precedence
        const sentiment: 'positive' | 'negative' | 'neutral' =
          score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral'
        const reason = reasons.length > 0 ? reasons.slice(0, 2).join(', ') : undefined
        return { sentiment, score, reason }
      }
    }
  }

  // PRIORITY 2: If no gaming slang found (or Starter tier), proceed with standard analysis

  // Profanity/insult list with strong negative weighting
  const profanity = [
    'fuck',
    'fucking',
    'shit',
    'bullshit',
    'bitch',
    'bastard',
    'asshole',
    'dick',
    'prick',
    'cunt',
    'twat',
    'wanker',
    'motherfucker',
    'mf',
    'wtf',
    'stfu',
    'retard',
    'retarded',
    'idiot',
    'dumb',
    'stupid',
    'trash',
    'garbage',
    'kill yourself',
    'kys',
  ]

  // Get language-specific sentiment words
  const positive = positiveWords[language] || positiveWords.english
  const negative = negativeWords[language] || negativeWords.english

  // Check for positive words
  positive.forEach((word) => {
    if (lowerText.includes(word)) {
      score += 1
      reasons.push(`positive word: "${word}"`)
    }
  })

  // Check for negative words
  negative.forEach((word) => {
    if (lowerText.includes(word)) {
      score -= 1
      reasons.push(`negative word: "${word}"`)
    }
  })

  // Profanity weighting
  profanity.forEach((word) => {
    if (lowerText.includes(word)) {
      score -= 2
      reasons.push(`profanity: "${word}"`)
    }
  })

  // Emoji sentiment analysis (universal)
  const positiveEmojis = [
    '😊',
    '😁',
    '😂',
    '🤣',
    '😍',
    '🥰',
    '😎',
    '🔥',
    '💯',
    '👍',
    '👏',
    '❤️',
    '💖',
    '✨',
    '🎉',
    '🙌',
    '💪',
    '🏆',
    '⭐',
  ]
  const negativeEmojis = [
    '😢',
    '😭',
    '😠',
    '😡',
    '🙄',
    '😴',
    '💔',
    '👎',
    '😬',
    '😖',
    '😤',
    '🤬',
    '💀',
    '😵',
  ]

  positiveEmojis.forEach((emoji) => {
    if (text.includes(emoji)) {
      score += 0.5
      reasons.push(`positive emoji: ${emoji}`)
    }
  })

  negativeEmojis.forEach((emoji) => {
    if (text.includes(emoji)) {
      score -= 0.5
      reasons.push(`negative emoji: ${emoji}`)
    }
  })

  // Excitement indicators
  if (/!{2,}/.test(text)) {
    score += 0.3
    reasons.push('excitement (multiple exclamation marks)')
  }

  // ALL CAPS excitement
  if (text === text.toUpperCase() && text.length > 3) {
    score += 0.2
    reasons.push('excitement (all caps)')
  }

  // Repeated letters (excitement)
  if (/(.)\1{2,}/.test(text)) {
    score += 0.2
    reasons.push('excitement (repeated letters)')
  }

  // Determine sentiment
  let sentiment: 'positive' | 'negative' | 'neutral'
  if (score > 0.5) sentiment = 'positive'
  else if (score < -0.5) sentiment = 'negative'
  else sentiment = 'neutral'

  const reason = reasons.length > 0 ? reasons.slice(0, 2).join(', ') : undefined

  return { sentiment, score, reason }
}

// Detect topics in the message
export function detectTopics(text: string): string[] {
  const lowerText = text.toLowerCase()
  const detectedTopics: string[] = []

  Object.keys(topicKeywords).forEach((topic) => {
    const keywords = topicKeywords[topic]
    const matches = keywords.filter((keyword) => lowerText.includes(keyword))
    if (matches.length > 0) {
      detectedTopics.push(topic)
    }
  })

  return detectedTopics
}

// Check if message indicates high engagement
export function getEngagementLevel(text: string): 'high' | 'medium' | 'low' {
  const lowerText = text.toLowerCase()

  // High engagement indicators
  const highCount = highEngagementWords.filter((word) => lowerText.includes(word)).length

  if (highCount > 0) return 'high'
  if (text.includes('!') || text.includes('?')) return 'medium'
  return 'low'
}

// Main analysis function
export function analyzeMessage(
  text: string,
  tier?: 'Starter' | 'Pro' | 'Agency'
): LanguageDetection {
  // Detect language (internal only; not shown in UI)
  const { language, confidence } = detectLanguage(text)

  // Check if it's a question
  const isQuestion = checkIsQuestion(text, language)

  // Analyze sentiment (with tier-gated gaming dictionary)
  const sentimentAnalysis = analyzeSentiment(text, language, tier)

  // Detect topics
  const topics = detectTopics(text)

  // Get engagement level
  const engagementLevel = getEngagementLevel(text)

  // Determine question type if it's a question
  let questionType: string | undefined
  if (isQuestion) {
    if (text.toLowerCase().includes('how')) questionType = 'how-to'
    else if (text.toLowerCase().includes('what')) questionType = 'what-is'
    else if (text.toLowerCase().includes('when')) questionType = 'timing'
    else if (text.toLowerCase().includes('where')) questionType = 'location'
    else if (text.toLowerCase().includes('why')) questionType = 'explanation'
    else if (text.toLowerCase().includes('who')) questionType = 'person'
    else questionType = 'general'
  }

  return {
    // keep internally if needed elsewhere
    language,
    confidence,
    isQuestion,
    sentiment: sentimentAnalysis.sentiment,
    sentimentReason: sentimentAnalysis.reason,
    sentimentScore: sentimentAnalysis.score,
    topics,
    engagementLevel,
    questionType,
  }
}

// Enhanced question detection
function checkIsQuestion(text: string, language: string): boolean {
  // Universal question mark - most reliable indicator
  if (text.includes('?') || text.includes('？')) return true

  // Must be at least 4 words to avoid false positives
  const words = text.trim().split(/\s+/)
  if (words.length < 4) return false

  // Language-specific question words
  const qWords = questionWords[language] || questionWords.english
  const lowerText = text.toLowerCase().trim()

  // Only check if text STARTS with question words (more precise)
  const startsWithQuestion = qWords.some((qWord) => {
    // Check if sentence starts with question word followed by space
    return lowerText.startsWith(qWord.toLowerCase() + ' ')
  })

  if (!startsWithQuestion) return false

  // Additional validation - must contain typical question patterns
  const questionPatterns = [
    /\b(can|could|would|should|will|do|does|did|is|are|was|were)\s+\w+/i,
    /\b(how|what|when|where|why|who)\s+\w+/i,
    /\b(any|anyone|anybody)\s+\w+/i,
  ]

  // Must match at least one question pattern for extra validation
  return questionPatterns.some((pattern) => pattern.test(text))
}

// Generate motivational AI suggestions based on chat patterns
export function generateMotivationalSuggestion(recentMessages: any[]): string | null {
  if (recentMessages.length < 5) return null

  const positiveCount = recentMessages.filter((m) => m.sentiment === 'positive').length
  const questionCount = recentMessages.filter((m) => m.isQuestion).length
  const highEngagementCount = recentMessages.filter((m) => m.engagementLevel === 'high').length

  // All topics mentioned recently
  const allTopics = recentMessages.flatMap((m) => m.topics || [])
  const topicCounts: { [key: string]: number } = {}
  allTopics.forEach((topic) => {
    topicCounts[topic] = (topicCounts[topic] || 0) + 1
  })

  const popularTopic = Object.keys(topicCounts).reduce(
    (a, b) => (topicCounts[a] > topicCounts[b] ? a : b),
    null
  )

  // Generate suggestions based on patterns
  const totalMessages = recentMessages.length
  const positiveRatio = positiveCount / totalMessages
  const questionRatio = questionCount / totalMessages
  const engagementRatio = highEngagementCount / totalMessages

  if (positiveRatio > 0.6) {
    return '🔥 Chat is absolutely loving the content right now! Keep this energy going - maybe ask them what their favorite moment has been so far?'
  }

  if (questionRatio > 0.4) {
    return '❓ Lots of questions coming in! Chat is super engaged and curious - perfect time to do a Q&A session or explain your process.'
  }

  if (engagementRatio > 0.3) {
    return '🎉 Chat is hyped! The energy is through the roof - consider doing something interactive like a poll or challenge!'
  }

  if (popularTopic && topicCounts[popularTopic] >= 3) {
    const suggestions = {
      gaming:
        '🎮 Chat seems really interested in your gameplay! Maybe share some tips or ask them about their own strategies?',
      technical:
        '⚙️ People are curious about your setup! Perfect time to show off your gear or explain your technical choices.',
      personal:
        '💭 Chat is connecting with your personal stories! They love getting to know the real you - keep sharing!',
      content:
        '📺 Chat is interested in your content creation process! Maybe give them a behind-the-scenes look?',
      music:
        "🎵 Everyone's vibing with the music! Ask them what their favorite tracks are or take some requests!",
    }
    return suggestions[popularTopic as keyof typeof suggestions] || null
  }

  return null
}
