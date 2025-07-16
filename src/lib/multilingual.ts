// src/lib/multilingual.ts - Comprehensive Language Support
export interface LanguageDetection {
  language: string
  confidence: number
  isQuestion: boolean
  sentiment: 'positive' | 'negative' | 'neutral'
  questionType?: string
  sentimentReason?: string
}

// Question words for different languages
const questionWords = {
  english: ['what', 'how', 'when', 'where', 'why', 'who', 'which', 'whose', 'whom'],
  spanish: ['qué', 'cómo', 'cuándo', 'dónde', 'por qué', 'quién', 'cuál', 'cuyo'],
  french: ['quoi', 'comment', 'quand', 'où', 'pourquoi', 'qui', 'quel', 'dont'],
  german: ['was', 'wie', 'wann', 'wo', 'warum', 'wer', 'welche', 'wessen'],
  portuguese: ['o que', 'como', 'quando', 'onde', 'por que', 'quem', 'qual', 'cujo'],
  italian: ['cosa', 'come', 'quando', 'dove', 'perché', 'chi', 'quale', 'cui'],
  dutch: ['wat', 'hoe', 'wanneer', 'waar', 'waarom', 'wie', 'welke', 'wiens'],
  japanese: ['何', 'どう', 'いつ', 'どこ', 'なぜ', 'だれ', 'どの', 'どれ'],
  korean: ['뭐', '어떻게', '언제', '어디', '왜', '누구', '어느', '무엇'],
  chinese: ['什么', '怎么', '什么时候', '哪里', '为什么', '谁', '哪个', '多少'],
  russian: ['что', 'как', 'когда', 'где', 'почему', 'кто', 'какой', 'чей'],
  arabic: ['ما', 'كيف', 'متى', 'أين', 'لماذا', 'من', 'أي', 'ماذا'],
  hindi: ['क्या', 'कैसे', 'कब', 'कहाँ', 'क्यों', 'कौन', 'कौन सा', 'कितना']
}

// Positive words for sentiment analysis
const positiveWords = {
  english: ['good', 'great', 'awesome', 'amazing', 'love', 'best', 'cool', 'nice', 'perfect', 'excellent'],
  spanish: ['bueno', 'genial', 'increíble', 'asombroso', 'amor', 'mejor', 'guay', 'agradable', 'perfecto'],
  french: ['bon', 'génial', 'incroyable', 'étonnant', 'amour', 'meilleur', 'cool', 'sympa', 'parfait'],
  german: ['gut', 'toll', 'unglaublich', 'erstaunlich', 'liebe', 'beste', 'cool', 'schön', 'perfekt'],
  portuguese: ['bom', 'ótimo', 'incrível', 'surpreendente', 'amor', 'melhor', 'legal', 'agradável', 'perfeito'],
  italian: ['buono', 'fantastico', 'incredibile', 'sorprendente', 'amore', 'migliore', 'figo', 'carino', 'perfetto'],
  dutch: ['goed', 'geweldig', 'ongelooflijk', 'verbazingwekkend', 'liefde', 'beste', 'cool', 'leuk', 'perfect'],
  japanese: ['良い', 'すごい', '信じられない', '驚くべき', '愛', '最高', 'クール', '素敵', '完璧'],
  korean: ['좋은', '대단한', '믿을 수 없는', '놀라운', '사랑', '최고', '멋진', '좋아', '완벽한'],
  chinese: ['好', '太棒了', '难以置信', '惊人', '爱', '最好', '酷', '不错', '完美'],
  russian: ['хорошо', 'отлично', 'невероятно', 'удивительно', 'любовь', 'лучший', 'круто', 'мило', 'идеально'],
  arabic: ['جيد', 'رائع', 'لا يصدق', 'مدهش', 'حب', 'أفضل', 'رائع', 'لطيف', 'مثالي'],
  hindi: ['अच्छा', 'बहुत बढ़िया', 'अविश्वसनीय', 'आश्चर्यजनक', 'प्रेम', 'सबसे अच्छा', 'कूल', 'अच्छा', 'परफेक्ट']
}

// Negative words for sentiment analysis
const negativeWords = {
  english: ['bad', 'terrible', 'awful', 'hate', 'worst', 'sucks', 'boring', 'stupid', 'annoying'],
  spanish: ['malo', 'terrible', 'horrible', 'odio', 'peor', 'apesta', 'aburrido', 'estúpido', 'molesto'],
  french: ['mauvais', 'terrible', 'affreux', 'déteste', 'pire', 'nul', 'ennuyeux', 'stupide', 'agaçant'],
  german: ['schlecht', 'schrecklich', 'furchtbar', 'hasse', 'schlechteste', 'nervt', 'langweilig', 'dumm', 'nervig'],
  portuguese: ['ruim', 'terrível', 'horrível', 'ódio', 'pior', 'péssimo', 'chato', 'estúpido', 'irritante'],
  italian: ['cattivo', 'terribile', 'orribile', 'odio', 'peggiore', 'fa schifo', 'noioso', 'stupido', 'fastidioso'],
  dutch: ['slecht', 'verschrikkelijk', 'afschuwelijk', 'haat', 'slechtste', 'zuigt', 'saai', 'dom', 'vervelend'],
  japanese: ['悪い', 'ひどい', '最悪', '嫌い', '最悪', 'つまらない', 'ばか', 'うざい'],
  korean: ['나쁜', '끔찍한', '최악', '싫어', '최악', '지루한', '바보', '짜증나는'],
  chinese: ['坏', '可怕', '糟糕', '讨厌', '最差', '无聊', '愚蠢', '烦人'],
  russian: ['плохо', 'ужасно', 'отвратительно', 'ненавижу', 'худший', 'отстой', 'скучно', 'глупо', 'раздражает'],
  arabic: ['سيء', 'فظيع', 'مروع', 'أكره', 'أسوأ', 'ممل', 'غبي', 'مزعج'],
  hindi: ['बुरा', 'भयानक', 'घृणित', 'नफरत', 'सबसे खराब', 'बोरिंग', 'बेवकूफ', 'परेशान करने वाला']
}

// Language patterns for detection
const languagePatterns = {
  spanish: /[ñáéíóúü]/,
  french: /[àâäçéèêëïîôùûüÿ]/,
  german: /[äöüß]/,
  portuguese: /[ãáàâéêíóôõúç]/,
  italian: /[àèéìíîòóù]/,
  russian: /[а-яё]/,
  arabic: /[\u0600-\u06FF]/,
  japanese: /[ひらがなカタカナ一-龯]/,
  korean: /[가-힣]/,
  chinese: /[\u4e00-\u9fff]/,
  hindi: /[\u0900-\u097F]/
}

export function detectLanguage(text: string): string {
  const lowerText = text.toLowerCase()
  
  // Remove usernames and common chat elements that might confuse detection
  const cleanText = lowerText
    .replace(/@\w+/g, '') // Remove @mentions
    .replace(/\b\w*\d+\w*\b/g, '') // Remove words with numbers (usernames)
    .replace(/[^\w\s]/g, ' ') // Remove special characters
    .trim()
  
  // If message is too short or mostly non-alphabetic, default to English
  if (cleanText.length < 10 || !/[a-zA-Z]/.test(cleanText)) {
    return 'english'
  }
  
  // Check for very specific language patterns with higher thresholds
  let languageScore: { [key: string]: number } = {}
  
  // Only detect non-English if we have strong indicators
  for (const [language, pattern] of Object.entries(languagePatterns)) {
    if (pattern.test(text)) {
      languageScore[language] = (languageScore[language] || 0) + 2
    }
  }
  
  // Check for language-specific question words (must be exact matches)
  for (const [language, words] of Object.entries(questionWords)) {
    if (language === 'english') continue
    
    for (const word of words) {
      // Only count if the word appears as a separate word (not part of username)
      const wordRegex = new RegExp(`\\b${word.toLowerCase()}\\b`, 'i')
      if (wordRegex.test(cleanText)) {
        languageScore[language] = (languageScore[language] || 0) + 1
      }
    }
  }
  
  // Require a minimum score to detect non-English languages
  const minScore = 2
  const detectedLanguage = Object.entries(languageScore)
    .filter(([_, score]) => score >= minScore)
    .sort(([,a], [,b]) => b - a)[0]
  
  // Default to English unless we have strong evidence of another language
  return detectedLanguage ? detectedLanguage[0] : 'english'
}

export function isQuestion(text: string, language: string): boolean {
  const lowerText = text.toLowerCase()
  
  // Universal question mark check (most reliable)
  if (text.includes('?') || text.includes('？')) {
    return true
  }
  
  // Clean text for better detection
  const cleanText = lowerText
    .replace(/@\w+/g, '') // Remove @mentions
    .replace(/\b\w*\d+\w*\b/g, '') // Remove words with numbers
    .trim()
  
  // Language-specific question word check (only for detected language)
  const words = questionWords[language as keyof typeof questionWords] || questionWords.english
  
  // Look for question words at the beginning of sentences or after punctuation
  for (const word of words) {
    const wordRegex = new RegExp(`(^|[.!]\\s+)${word.toLowerCase()}\\b`, 'i')
    if (wordRegex.test(cleanText)) {
      return true
    }
  }
  
  return false
}

export function analyzeSentiment(text: string, language: string): 'positive' | 'negative' | 'neutral' {
  const lowerText = text.toLowerCase()
  
  // Get language-specific sentiment words
  const positive = positiveWords[language as keyof typeof positiveWords] || positiveWords.english
  const negative = negativeWords[language as keyof typeof negativeWords] || negativeWords.english
  
  // Count positive and negative words
  let positiveCount = 0
  let negativeCount = 0
  
  positive.forEach(word => {
    if (lowerText.includes(word.toLowerCase())) {
      positiveCount++
    }
  })
  
  negative.forEach(word => {
    if (lowerText.includes(word.toLowerCase())) {
      negativeCount++
    }
  })
  
  // Check for universal emoji sentiment
  const positiveEmojis = ['😊', '😍', '🔥', '👍', '❤️', '💖', '🎉', '✨', '😂', '💪']
  const negativeEmojis = ['😢', '😠', '👎', '💔', '😞', '😤', '🤮', '💩', '😡', '😭']
  
  positiveEmojis.forEach(emoji => {
    if (text.includes(emoji)) {
      positiveCount += 2 // Emojis weight more
    }
  })
  
  negativeEmojis.forEach(emoji => {
    if (text.includes(emoji)) {
      negativeCount += 2
    }
  })
  
  if (positiveCount > negativeCount) return 'positive'
  if (negativeCount > positiveCount) return 'negative'
  return 'neutral'
}

export function getQuestionType(text: string, language: string): string {
  const lowerText = text.toLowerCase()
  const words = questionWords[language as keyof typeof questionWords] || questionWords.english
  
  // Map question words to types
  const typeMap: { [key: string]: string } = {
    // What/Qué/Quoi/Was/O que/Cosa/Wat/何/뭐/什么/что/ما/क्या
    'what': 'explanation',
    'qué': 'explanation',
    'quoi': 'explanation', 
    'was': 'explanation',
    'o que': 'explanation',
    'cosa': 'explanation',
    'wat': 'explanation',
    '何': 'explanation',
    '뭐': 'explanation',
    '什么': 'explanation',
    'что': 'explanation',
    'ما': 'explanation',
    'क्या': 'explanation',
    
    // How/Cómo/Comment/Wie/Como/Come/Hoe/どう/어떻게/怎么/как/كيف/कैसे
    'how': 'instruction',
    'cómo': 'instruction',
    'comment': 'instruction',
    'wie': 'instruction',
    'como': 'instruction',
    'come': 'instruction',
    'hoe': 'instruction',
    'どう': 'instruction',
    '어떻게': 'instruction',
    '怎么': 'instruction',
    'как': 'instruction',
    'كيف': 'instruction',
    'कैसे': 'instruction',
    
    // Where/Dónde/Où/Wo/Onde/Dove/Waar/どこ/어디/哪里/где/أين/कहाँ
    'where': 'location',
    'dónde': 'location',
    'où': 'location',
    'wo': 'location',
    'onde': 'location',
    'dove': 'location',
    'waar': 'location',
    'どこ': 'location',
    '어디': 'location',
    '哪里': 'location',
    'где': 'location',
    'أين': 'location',
    'कहाँ': 'location'
  }
  
  for (const word of words) {
    if (lowerText.includes(word.toLowerCase())) {
      return typeMap[word.toLowerCase()] || 'general'
    }
  }
  
  return 'general'
}

export function analyzeMessage(text: string): LanguageDetection {
  const language = detectLanguage(text)
  const isQuestionResult = isQuestion(text, language)
  const sentiment = analyzeSentiment(text, language)
  const questionType = isQuestionResult ? getQuestionType(text, language) : undefined
  
  // Calculate confidence based on detection certainty
  let confidence = 0.7 // Base confidence
  
  // Increase confidence for specific patterns
  if (languagePatterns[language as keyof typeof languagePatterns]?.test(text)) {
    confidence += 0.2
  }
  
  if (isQuestionResult && text.includes('?')) {
    confidence += 0.1
  }
  
  // Generate sentiment reason
  let sentimentReason = ''
  if (sentiment === 'positive') {
    sentimentReason = 'Contains positive words or emojis'
  } else if (sentiment === 'negative') {
    sentimentReason = 'Contains negative words or emojis'
  } else {
    sentimentReason = 'Neutral tone detected'
  }
  
  return {
    language,
    confidence: Math.min(confidence, 1.0),
    isQuestion: isQuestionResult,
    sentiment,
    questionType,
    sentimentReason
  }
}
