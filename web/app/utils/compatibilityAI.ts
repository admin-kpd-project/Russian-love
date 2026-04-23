// Mock AI compatibility algorithm
export interface UserProfile {
  id: number | string;
  name: string;
  age: number;
  bio: string;
  interests: string[];
  location: string;
  photo: string;
  personality: {
    extroversion: number; // 0-100
    openness: number;
    conscientiousness: number;
    agreeableness: number;
    emotionalStability: number;
  };
  astrology: {
    zodiacSign: string;
    element: 'fire' | 'earth' | 'air' | 'water';
    moonSign: string;
    ascendant: string;
  };
  numerology: {
    lifePath: number; // 1-9, 11, 22, 33
    soulUrge: number;
    destiny: number;
  };
  birthDate: string; // For horoscope calculations
}

// Current user profile (mock)
export const currentUser: UserProfile = {
  id: 0,
  name: "Иван",
  age: 28,
  bio: "Люблю путешествия и новые впечатления. Работаю в IT, занимаюсь спортом и фотографией. Ищу серьезные отношения с человеком, с которым можно разделить интересы и построить будущее.",
  interests: ["Путешествия", "Фотография", "Музыка", "Фитнес", "Кино"],
  location: "Москва",
  photo: "https://images.unsplash.com/photo-1770894807442-108cc33c0a7a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB5b3VuZyUyMG1hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc3NDk1MjYxNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  personality: {
    extroversion: 65,
    openness: 80,
    conscientiousness: 70,
    agreeableness: 75,
    emotionalStability: 68,
  },
  astrology: {
    zodiacSign: "Овен",
    element: "fire",
    moonSign: "Рак",
    ascendant: "Скорпион",
  },
  numerology: {
    lifePath: 4,
    soulUrge: 5,
    destiny: 9,
  },
  birthDate: "1995-04-15",
};

/**
 * AI-based compatibility calculation algorithm
 * Analyzes multiple factors to determine compatibility percentage
 */
export function calculateCompatibility(user1: UserProfile, user2: UserProfile): number {
  // 1. Personality compatibility (40% weight)
  const personalityScore = calculatePersonalityMatch(user1.personality, user2.personality);
  
  // 2. Shared interests (30% weight)
  const interestsScore = calculateInterestsMatch(user1.interests, user2.interests);
  
  // 3. Age compatibility (15% weight)
  const ageScore = calculateAgeCompatibility(user1.age, user2.age);
  
  // 4. Location proximity (15% weight)
  const locationScore = user1.location === user2.location ? 100 : 60;
  
  // Weighted average
  const totalScore = 
    personalityScore * 0.4 +
    interestsScore * 0.3 +
    ageScore * 0.15 +
    locationScore * 0.15;
  
  // Add small random variation for realism (±3%)
  const variation = (Math.random() - 0.5) * 6;
  
  return Math.max(50, Math.min(99, Math.round(totalScore + variation)));
}

function calculatePersonalityMatch(p1: UserProfile['personality'], p2: UserProfile['personality']): number {
  const traits = ['extroversion', 'openness', 'conscientiousness', 'agreeableness', 'emotionalStability'] as const;
  
  let totalScore = 0;
  traits.forEach(trait => {
    const diff = Math.abs(p1[trait] - p2[trait]);
    // Similar personalities score higher (inverse of difference)
    const score = 100 - diff;
    totalScore += score;
  });
  
  return totalScore / traits.length;
}

function calculateInterestsMatch(interests1: string[], interests2: string[]): number {
  const sharedInterests = interests1.filter(interest => 
    interests2.includes(interest)
  ).length;
  
  const totalUniqueInterests = new Set([...interests1, ...interests2]).size;
  
  if (totalUniqueInterests === 0) return 50;
  
  // Jaccard similarity coefficient, scaled to favor some overlap
  const jaccardIndex = sharedInterests / totalUniqueInterests;
  return Math.min(100, 50 + jaccardIndex * 100);
}

function calculateAgeCompatibility(age1: number, age2: number): number {
  const ageDiff = Math.abs(age1 - age2);
  
  if (ageDiff <= 2) return 100;
  if (ageDiff <= 5) return 90;
  if (ageDiff <= 8) return 75;
  if (ageDiff <= 12) return 60;
  return 40;
}

export function getCompatibilityLabel(percentage: number): string {
  if (percentage >= 90) return "Идеальное совпадение";
  if (percentage >= 80) return "Отличная совместимость";
  if (percentage >= 70) return "Высокая совместимость";
  if (percentage >= 60) return "Хорошая совместимость";
  return "Средняя совместимость";
}

// Zodiac compatibility matrix
const zodiacCompatibility: { [key: string]: string[] } = {
  "Овен": ["Лев", "Стрелец", "Близнецы", "Водолей"],
  "Телец": ["Дева", "Козерог", "Рак", "Рыбы"],
  "Близнецы": ["Весы", "Водолей", "Овен", "Лев"],
  "Рак": ["Скорпион", "Рыбы", "Телец", "Дева"],
  "Лев": ["Овен", "Стрелец", "Близнецы", "Весы"],
  "Дева": ["Телец", "Козерог", "Рак", "Скорпион"],
  "Весы": ["Близнецы", "Водолей", "Лев", "Стрелец"],
  "Скорпион": ["Рак", "Рыбы", "Дева", "Козерог"],
  "Стрелец": ["Овен", "Лев", "Весы", "Водолей"],
  "Козерог": ["Телец", "Дева", "Скорпион", "Рыбы"],
  "Водолей": ["Близнецы", "Весы", "Овен", "Стрелец"],
  "Рыбы": ["Рак", "Скорпион", "Телец", "Козерог"],
};

// Element compatibility
const elementCompatibility: { [key: string]: string[] } = {
  "fire": ["fire", "air"],
  "earth": ["earth", "water"],
  "air": ["air", "fire"],
  "water": ["water", "earth"],
};

function calculateAstrologyScore(user1: UserProfile, user2: UserProfile): {
  score: number;
  zodiacCompatible: boolean;
  elementMatch: boolean;
  moonMatch: boolean;
  details: string;
} {
  const compatibleZodiacs = zodiacCompatibility[user1.astrology.zodiacSign] || [];
  const zodiacCompatible = compatibleZodiacs.includes(user2.astrology.zodiacSign);
  
  const compatibleElements = elementCompatibility[user1.astrology.element] || [];
  const elementMatch = compatibleElements.includes(user2.astrology.element);
  
  const moonMatch = user1.astrology.moonSign === user2.astrology.moonSign;
  const ascendantMatch = user1.astrology.ascendant === user2.astrology.ascendant;
  
  let score = 50; // Base score
  if (zodiacCompatible) score += 25;
  if (elementMatch) score += 15;
  if (moonMatch) score += 10;
  if (ascendantMatch) score += 10;
  
  const details = `Ваши знаки ${zodiacCompatible ? "совместимы" : "требуют работы"}. Элементы ${elementMatch ? "гармонируют" : "дополняют друг друга"}. ${moonMatch ? "Луны совпадают - эмоциональное единство!" : "Разные лунные знаки добавляют разнообразие."}`;
  
  return {
    score: Math.min(100, score),
    zodiacCompatible,
    elementMatch,
    moonMatch,
    details,
  };
}

// Numerology compatibility
const compatibleLifePaths: { [key: number]: number[] } = {
  1: [1, 5, 7],
  2: [2, 4, 8],
  3: [3, 6, 9],
  4: [2, 4, 8],
  5: [1, 5, 7],
  6: [3, 6, 9],
  7: [1, 5, 7],
  8: [2, 4, 8],
  9: [3, 6, 9],
};

function calculateNumerologyScore(user1: UserProfile, user2: UserProfile): {
  score: number;
  lifePathMatch: number;
  soulUrgeMatch: number;
  destinyMatch: number;
  details: string;
} {
  const compatiblePaths = compatibleLifePaths[user1.numerology.lifePath] || [];
  const lifePathCompatible = compatiblePaths.includes(user2.numerology.lifePath);
  const lifePathMatch = lifePathCompatible ? 100 : (user1.numerology.lifePath === user2.numerology.lifePath ? 90 : 60);
  
  const soulUrgeDiff = Math.abs(user1.numerology.soulUrge - user2.numerology.soulUrge);
  const soulUrgeMatch = 100 - (soulUrgeDiff * 11);
  
  const destinyDiff = Math.abs(user1.numerology.destiny - user2.numerology.destiny);
  const destinyMatch = 100 - (destinyDiff * 11);
  
  const totalScore = (lifePathMatch * 0.5 + soulUrgeMatch * 0.25 + destinyMatch * 0.25);
  
  const details = `Числа жизненного пути ${lifePathCompatible ? "идеально сочетаются" : "создают интересную динамику"}. Ваши души ${soulUrgeMatch > 70 ? "стремятся к одному" : "дополняют друг друга"}. Судьбы ${destinyMatch > 70 ? "переплетены" : "идут параллельно"}.`;
  
  return {
    score: Math.round(totalScore),
    lifePathMatch: Math.round(lifePathMatch),
    soulUrgeMatch: Math.round(Math.max(0, soulUrgeMatch)),
    destinyMatch: Math.round(Math.max(0, destinyMatch)),
    details,
  };
}

export interface CompatibilityDetails {
  total: number;
  personality: {
    score: number;
    weight: number;
    traits: {
      extroversion: { user1: number; user2: number; match: number };
      openness: { user1: number; user2: number; match: number };
      conscientiousness: { user1: number; user2: number; match: number };
      agreeableness: { user1: number; user2: number; match: number };
      emotionalStability: { user1: number; user2: number; match: number };
    };
  };
  interests: {
    score: number;
    weight: number;
    shared: string[];
    total: number;
  };
  age: {
    score: number;
    weight: number;
    difference: number;
  };
  location: {
    score: number;
    weight: number;
    same: boolean;
  };
  astrology: {
    score: number;
    weight: number;
    zodiacCompatible: boolean;
    elementMatch: boolean;
    moonMatch: boolean;
    details: string;
  };
  numerology: {
    score: number;
    weight: number;
    lifePathMatch: number;
    soulUrgeMatch: number;
    destinyMatch: number;
    details: string;
  };
}

export function calculateDetailedCompatibility(user1: UserProfile, user2: UserProfile): CompatibilityDetails {
  // Calculate personality match with details
  const traits = ['extroversion', 'openness', 'conscientiousness', 'agreeableness', 'emotionalStability'] as const;
  const personalityTraits: any = {};
  let personalityTotal = 0;
  
  traits.forEach(trait => {
    const diff = Math.abs(user1.personality[trait] - user2.personality[trait]);
    const match = 100 - diff;
    personalityTraits[trait] = {
      user1: user1.personality[trait],
      user2: user2.personality[trait],
      match: match,
    };
    personalityTotal += match;
  });
  
  const personalityScore = personalityTotal / traits.length;
  
  // Calculate interests match with details
  const sharedInterests = user1.interests.filter(interest => 
    user2.interests.includes(interest)
  );
  const totalUniqueInterests = new Set([...user1.interests, ...user2.interests]).size;
  const jaccardIndex = totalUniqueInterests > 0 ? sharedInterests.length / totalUniqueInterests : 0;
  const interestsScore = Math.min(100, 50 + jaccardIndex * 100);
  
  // Calculate age compatibility
  const ageDiff = Math.abs(user1.age - user2.age);
  let ageScore = 40;
  if (ageDiff <= 2) ageScore = 100;
  else if (ageDiff <= 5) ageScore = 90;
  else if (ageDiff <= 8) ageScore = 75;
  else if (ageDiff <= 12) ageScore = 60;
  
  // Calculate location score
  const locationScore = user1.location === user2.location ? 100 : 60;
  
  // Calculate astrology score
  const astrologyScore = calculateAstrologyScore(user1, user2);
  
  // Calculate numerology score
  const numerologyScore = calculateNumerologyScore(user1, user2);
  
  // Total score
  const totalScore = 
    personalityScore * 0.4 +
    interestsScore * 0.3 +
    ageScore * 0.15 +
    locationScore * 0.15;
  
  const variation = (Math.random() - 0.5) * 6;
  const finalScore = Math.max(50, Math.min(99, Math.round(totalScore + variation)));
  
  return {
    total: finalScore,
    personality: {
      score: Math.round(personalityScore),
      weight: 40,
      traits: personalityTraits,
    },
    interests: {
      score: Math.round(interestsScore),
      weight: 30,
      shared: sharedInterests,
      total: totalUniqueInterests,
    },
    age: {
      score: ageScore,
      weight: 15,
      difference: ageDiff,
    },
    location: {
      score: locationScore,
      weight: 15,
      same: user1.location === user2.location,
    },
    astrology: {
      score: astrologyScore.score,
      weight: 10,
      zodiacCompatible: astrologyScore.zodiacCompatible,
      elementMatch: astrologyScore.elementMatch,
      moonMatch: astrologyScore.moonMatch,
      details: astrologyScore.details,
    },
    numerology: {
      score: numerologyScore.score,
      weight: 10,
      lifePathMatch: numerologyScore.lifePathMatch,
      soulUrgeMatch: numerologyScore.soulUrgeMatch,
      destinyMatch: numerologyScore.destinyMatch,
      details: numerologyScore.details,
    },
  };
}