// src/lib/multilingual.ts - Comprehensive Language Support

export interface LanguageDetection {
  language: string
  confidence: number
  isQuestion: boolean
  sentiment: 'positive' | 'negative' | 'neutral'
  questionType?: string
  sentimentReasons?: string[]
}

// Question words by language
const QUESTION_WORDS = {
  english: ['what', 'how', 'when', 'where', 'why', 'who', 'which', 'whose', 'whom'],
  spanish: ['qué', 'que', 'cómo', 'como', 'cuándo', 'cuando', 'dónde', 'donde', 'por qué', 'por que', 'quién', 'quien', 'cuál', 'cual'],
  french: ['quoi', 'comment', 'quand', 'où', 'ou', 'pourquoi', 'qui', 'quel', 'quelle', 'quels', 'quelles'],
  german: ['was', 'wie', 'wann', 'wo', 'warum', 'wer', 'welche', 'welcher', 'welches'],
  portuguese: ['o que', 'que', 'como', 'quando', 'onde', 'por que', 'porque', 'quem', 'qual'],
  italian: ['cosa', 'come', 'quando', 'dove', 'perché', 'perche', 'chi', 'quale', 'quali'],
  dutch: ['wat', 'hoe', 'wanneer', 'waar', 'waarom', 'wie', 'welke'],
  japanese: ['何', 'なに', 'なん', 'どう', 'いつ', 'どこ', 'なぜ', 'だれ', 'どれ', 'どの'],
  korean: ['뭐', '무엇', '어떻게', '언제', '어디', '왜', '누구', '어느'],
  chinese: ['什么', '怎么', '什么时候', '哪里', '为什么', '谁', '哪个'],
  russian: ['что', 'как', 'когда', 'где', 'почему', 'кто', 'какой', 'какая'],
  arabic: ['ما', 'كيف', 'متى', 'أين', 'لماذا', 'من', 'أي'],
  hindi: ['क्या', 'कैसे', 'कब', 'कहाँ', 'क्यों', 'कौन', 'कौन सा']
}

// Sentiment words by language
const SENTIMENT_WORDS = {
  english: {
    positive: ['good', 'great', 'awesome', 'amazing', 'excellent', 'perfect', 'love', 'best', 'cool', 'nice', 'fantastic', 'brilliant', 'wonderful', 'outstanding', 'incredible'],
    negative: ['bad', 'terrible', 'awful', 'horrible', 'hate', 'worst', 'stupid', 'boring', 'lame', 'trash', 'garbage', 'annoying', 'frustrating', 'disappointing']
  },
  spanish: {
    positive: ['bueno', 'genial', 'increíble', 'excelente', 'perfecto', 'amor', 'mejor', 'guay', 'fantástico', 'maravilloso', 'estupendo'],
    negative: ['malo', 'terrible', 'horrible', 'odio', 'peor', 'estúpido', 'aburrido', 'basura', 'molesto', 'frustrante']
  },
  french: {
    positive: ['bon', 'génial', 'incroyable', 'excellent', 'parfait', 'amour', 'meilleur', 'cool', 'fantastique', 'merveilleux', 'formidable'],
    negative: ['mauvais', 'terrible', 'horrible', 'déteste', 'pire', 'stupide', 'ennuyeux', 'nul', 'agaçant', 'frustrant']
  },
  german: {
    positive: ['gut', 'toll', 'unglaublich', 'ausgezeichnet', 'perfekt', 'liebe', 'beste', 'cool', 'fantastisch', 'wunderbar', 'großartig'],
    negative: ['schlecht', 'schrecklich', 'furchtbar', 'hasse', 'schlechteste', 'dumm', 'langweilig', 'müll', 'nervig', 'frustrierend']
  },
  portuguese: {
    positive: ['bom', 'ótimo', 'incrível', 'excelente', 'perfeito', 'amor', 'melhor', 'legal', 'fantástico', 'maravilhoso'],
    negative: ['ruim', 'terrível', 'horrível', 'odeio', 'pior', 'estúpido', 'chato', 'lixo', 'irritante', 'frustrante']
  },
  italian: {
    positive: ['buono', 'fantastico', 'incredibile', 'eccellente', 'perfetto', 'amore', 'migliore', 'figo', 'meraviglioso'],
    negative: ['cattivo', 'terribile', 'orribile', 'odio', 'peggiore', 'stupido', 'noioso', 'spazzatura', 'fastidioso']
  },
  dutch: {
    positive: ['goed', 'geweldig', 'ongelofelijk', 'uitstekend', 'perfect', 'liefde', 'beste', 'cool', 'fantastisch'],
    negative: ['slecht', 'verschrikkelijk', 'afschuwelijk', 'haat', 'ergste', 'dom', 'saai', 'rotzooi', 'irritant']
  },
  japanese: {
    positive: ['良い', 'いい', 'すごい', '素晴らしい', '完璧', '愛', '最高', 'かっこいい', '素敵'],
    negative: ['悪い', 'ひどい', '最悪', '嫌い', 'つまらない', 'むかつく', 'うざい']
  },
  korean: {
    positive: ['좋다', '좋은', '대박', '최고', '완벽', '사랑', '멋있다', '예쁘다', '훌륭하다'],
    negative: ['나쁘다', '나쁜', '최악', '싫다', '지루하다', '짜증', '별로']
  },
  chinese: {
    positive: ['好', '很好', '棒', '完美', '爱', '最好', '酷', '太棒了', '优秀'],
    negative: ['坏', '糟糕', '最坏', '讨厌', '无聊', '烦人', '差']
  },
  russian: {
    positive: ['хорошо', 'отлично', 'прекрасно', 'идеально', 'любовь', 'лучший', 'круто', 'замечательно'],
    negative: ['плохо', 'ужасно', 'отвратительно', 'ненавижу', 'худший', 'глупо', 'скучно', 'раздражает']
  },
  arabic: {
    positive: ['جيد', 'ممتاز', 'رائع', 'مثالي', 'حب', 'أفضل', 'رهيب', 'عظيم'],
    negative: ['سيء', 'فظيع', 'مروع', 'أكره', 'أسوأ', 'غبي', 'ممل', 'مزعج']
  }
}

// Universal sentiment indicators (emojis work across all languages)
const EMOJI_SENTIMENT = {
  positive: ['😊', '😄', '😆', '🤣', '😂', '🥰', '😍', '🤩', '😎', '👍', '👏', '🔥', '💯', '❤️', '💕', '✨', '🎉', '🥳', '🙌', '💪'],
  negative: ['😢', '😭', '😞', '😔', '😒', '😤', '😠', '😡', '🤬', '👎', '💔', '😩', '😫', '🙄', '😬', '😰', '😨', '😱']
}

// Question indicators that work across languages
const UNIVERSAL_QUESTION_INDICATORS = ['?', '？', '؟'] // Latin, Japanese/Chinese, Arabic question marks

export function detectLanguageAndAnalyze(message: string): LanguageDetection {
  const normalizedMessage = message.toLowerCase().trim()
  
  // Detect primary language
  const detectedLanguage = detectPrimaryLanguage(normalizedMessage)
  
  // Check if it's a question
  const questionAnalysis = detectQuestion(normalizedMessage, detectedLanguage)
  
  // Analyze sentiment
  const sentimentAnalysis = analyzeSentiment(normalizedMessage, detectedLanguage)
  
  return {
    language: detectedLanguage,
    confidence: calculateConfidence(normalizedMessage, detectedLanguage),
    isQuestion: questionAnalysis.isQuestion,
    questionType: questionAnalysis.type,
    sentiment: sentimentAnalysis.sentiment,
    sentimentReasons: sentimentAnalysis.reasons
  }
}

function detectPrimaryLanguage(message: string): string {
  const scores: { [key: string]: number } = {}
  
  // Check each language for matching words
  Object.entries(QUESTION_WORDS).forEach(([language, words]) => {
    scores[language] = 0
    words.forEach(word => {
      if (message.includes(word)) {
        scores[language] += word.length // Longer words get higher scores
      }
    })
  })
  
  // Also check sentiment words
  Object.entries(SENTIMENT_WORDS).forEach(([language, categories]) => {
    if (!scores[language]) scores[language] = 0
    
    [...categories.positive, ...categories.negative].forEach(word => {
      if (message.includes(word)) {
        scores[language] += word.length
      }
    })
  })
  
  // Check for non-Latin scripts
  if (/[\u4e00-\u9fff]/.test(message)) scores['chinese'] = (scores['chinese'] || 0) + 10
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(message)) scores['japanese'] = (scores['japanese'] || 0) + 10
  if (/[\uac00-\ud7af]/.test(message)) scores['korean'] = (scores['korean'] || 0) + 10
  if (/[\u0600-\u06ff]/.test(message)) scores['arabic'] = (scores['arabic'] || 0) + 10
  if (/[\u0900-\u097f]/.test(message)) scores['hindi'] = (scores['hindi'] || 0) + 10
  if (/[\u0400-\u04ff]/.test(message)) scores['russian'] = (scores['russian'] || 0) + 10
  
  // Find language with highest score
  const maxScore = Math.max(...Object.values(scores))
  const detectedLanguage = Object.keys(scores).find(lang => scores[lang] === maxScore)
  
  return detectedLanguage || 'english' // Default to English
}

function detectQuestion(message: string, language: string): { isQuestion: boolean; type?: string } {
  // Check for universal question marks
  const hasQuestionMark = UNIVERSAL_QUESTION_INDICATORS.some(mark => message.includes(mark))
  
  // Check for language-specific question words
  const questionWords = QUESTION_WORDS[language] || QUESTION_WORDS.english
  const hasQuestionWord = questionWords.some(word => message.includes(word))
  
  // Determine question type
  let questionType: string | undefined
  if (hasQuestionWord || hasQuestionMark) {
    if (questionWords.some(word => ['what', 'qué', 'quoi', 'was', 'o que', 'cosa', 'wat', '何'].includes(word) && message.includes(word))) {
      questionType = 'what'
    } else if (questionWords.some(word => ['how', 'cómo', 'comment', 'wie', 'como', 'come', 'hoe', 'どう'].includes(word) && message.includes(word))) {
      questionType = 'how'
    } else if (questionWords.some(word => ['when', 'cuándo', 'quand', 'wann', 'quando', 'wanneer', 'いつ'].includes(word) && message.includes(word))) {
      questionType = 'when'
    } else if (questionWords.some(word => ['where', 'dónde', 'où', 'wo', 'onde', 'dove', 'waar', 'どこ'].includes(word) && message.includes(word))) {
      questionType = 'where'
    } else if (questionWords.some(word => ['why', 'por qué', 'pourquoi', 'warum', 'por que', 'perché', 'waarom', 'なぜ'].includes(word) && message.includes(word))) {
      questionType = 'why'
    } else if (questionWords.some(word => ['who', 'quién', 'qui', 'wer', 'quem', 'chi', 'wie', 'だれ'].includes(word) && message.includes(word))) {
      questionType = 'who'
    } else {
      questionType = 'general'
    }
  }
  
  return {
    isQuestion: hasQuestionMark || hasQuestionWord,
    type: questionType
  }
}

function analyzeSentiment(message: string, language: string): { sentiment: 'positive' | 'negative' | 'neutral'; reasons: string[] } {
  const reasons: string[] = []
  let positiveScore = 0
  let negativeScore = 0
  
  // Check language-specific sentiment words
  const sentimentDict = SENTIMENT_WORDS[language] || SENTIMENT_WORDS.english
  
  sentimentDict.positive.forEach(word => {
    if (message.includes(word)) {
      positiveScore += 1
      reasons.push(`Positive word: "${word}"`)
    }
  })
  
  sentimentDict.negative.forEach(word => {
    if (message.includes(word)) {
      negativeScore += 1
      reasons.push(`Negative word: "${word}"`)
    }
  })
  
  // Check universal emoji sentiment
  EMOJI_SENTIMENT.positive.forEach(emoji => {
    if (message.includes(emoji)) {
      positiveScore += 1
      reasons.push(`Positive emoji: ${emoji}`)
    }
  })
  
  EMOJI_SENTIMENT.negative.forEach(emoji => {
    if (message.includes(emoji)) {
      negativeScore += 1
      reasons.push(`Negative emoji: ${emoji}`)
    }
  })
  
  // Determine overall sentiment
  let sentiment: 'positive' | 'negative' | 'neutral'
  if (positiveScore > negativeScore) {
    sentiment = 'positive'
  } else if (negativeScore > positiveScore) {
    sentiment = 'negative'
  } else {
    sentiment = 'neutral'
  }
  
  return { sentiment, reasons }
}

function calculateConfidence(message: string, detectedLanguage: string): number {
  // Simple confidence calculation based on how many language-specific elements we found
  const questionWords = QUESTION_WORDS[detectedLanguage] || []
  const sentimentWords = SENTIMENT_WORDS[detectedLanguage] || { positive: [], negative: [] }
  
  let matches = 0
  const totalWords = message.split(' ').length
  
  questionWords.forEach(word => {
    if (message.includes(word)) matches++
  })
  
  ;[...sentimentWords.positive, ...sentimentWords.negative].forEach(word => {
    if (message.includes(word)) matches++
  })
  
  // Higher confidence for more matches relative to message length
  return Math.min(0.95, Math.max(0.3, matches / totalWords))
}

// Enhanced message analysis function for the dashboard
export function analyzeMessage(username: string, messageText: string): {
  id: string
  username: string
  message: string
  timestamp: Date
  sentiment: 'positive' | 'negative' | 'neutral'
  isQuestion: boolean
  priority: number
  language: string
  confidence: number
  questionType?: string
  sentimentReasons?: string[]
} {
  const analysis = detectLanguageAndAnalyze(messageText)
  
  // Calculate priority (questions get higher priority)
  let priority = Math.floor(Math.random() * 6) + 1
  if (analysis.isQuestion) {
    priority = Math.floor(Math.random() * 3) + 8 // 8-10 for questions
  }
  if (analysis.sentiment === 'negative') {
    priority += 1 // Boost negative sentiment priority
  }
  
  return {
    id: Date.now().toString() + Math.random(),
    username,
    message: messageText,
    timestamp: new Date(),
    sentiment: analysis.sentiment,
    isQuestion: analysis.isQuestion,
    priority,
    language: analysis.language,
    confidence: analysis.confidence,
    questionType: analysis.questionType,
    sentimentReasons: analysis.sentimentReasons
  }
}
