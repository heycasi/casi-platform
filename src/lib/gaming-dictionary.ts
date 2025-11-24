// src/lib/gaming-dictionary.ts

export type SentimentScore = -1 | 0 | 1 // -1: Negative, 0: Neutral, 1: Positive

interface GamingSlang {
  [key: string]: {
    score: SentimentScore
    category: 'hype' | 'toxic' | 'funny' | 'support'
  }
}

export const TWITCH_SENTIMENT_DICTIONARY: GamingSlang = {
  // --- POSITIVE / HYPE (Score: 1) ---
  w: { score: 1, category: 'hype' },
  dub: { score: 1, category: 'hype' },
  pog: { score: 1, category: 'hype' },
  poggers: { score: 1, category: 'hype' },
  pogchamp: { score: 1, category: 'hype' },
  ez: { score: 1, category: 'hype' },
  clap: { score: 1, category: 'support' },
  gg: { score: 1, category: 'support' },
  sheesh: { score: 1, category: 'hype' },
  based: { score: 1, category: 'support' },
  goat: { score: 1, category: 'support' },
  god: { score: 1, category: 'hype' },
  huge: { score: 1, category: 'hype' },
  letshimcook: { score: 1, category: 'hype' },
  letthemcook: { score: 1, category: 'hype' },
  cinema: { score: 1, category: 'hype' },
  kreygasm: { score: 1, category: 'hype' },
  gasm: { score: 1, category: 'hype' },

  // --- FUNNY / NEUTRAL-POSITIVE (Score: 1) ---
  lul: { score: 1, category: 'funny' },
  lulw: { score: 1, category: 'funny' },
  kek: { score: 1, category: 'funny' },
  kekw: { score: 1, category: 'funny' },
  omega: { score: 1, category: 'funny' },
  icant: { score: 1, category: 'funny' },
  dead: { score: 1, category: 'funny' },
  skull: { score: 1, category: 'funny' },

  // --- NEGATIVE / TOXIC / FAIL (Score: -1) ---
  l: { score: -1, category: 'toxic' },
  rip: { score: -1, category: 'toxic' },
  f: { score: -1, category: 'toxic' },
  cringe: { score: -1, category: 'toxic' },
  fail: { score: -1, category: 'toxic' },
  throw: { score: -1, category: 'toxic' },
  throwing: { score: -1, category: 'toxic' },
  choke: { score: -1, category: 'toxic' },
  washed: { score: -1, category: 'toxic' },
  mid: { score: -1, category: 'toxic' },
  cap: { score: -1, category: 'toxic' },
  kappa: { score: -1, category: 'toxic' },
  scam: { score: -1, category: 'toxic' },
  rigged: { score: -1, category: 'toxic' },
  residentsleeper: { score: -1, category: 'toxic' },
  zz: { score: -1, category: 'toxic' },
  yikes: { score: -1, category: 'toxic' },
  monkas: { score: -1, category: 'toxic' },
  sus: { score: -1, category: 'toxic' },
}

// Helper function
export function getGamingSentiment(word: string): number | null {
  // Remove non-alphanumeric chars to match "W!!!!" as "w"
  const cleanWord = word.toLowerCase().replace(/[^a-z0-9]/g, '')
  if (TWITCH_SENTIMENT_DICTIONARY[cleanWord]) {
    return TWITCH_SENTIMENT_DICTIONARY[cleanWord].score
  }
  return null
}
