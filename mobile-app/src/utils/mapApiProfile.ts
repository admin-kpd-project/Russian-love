import type { Profile } from "../api/authApi";
import type { UserProfile } from "./compatibilityAI";
import { resolveMediaUrl } from "./mediaUrl";

const defaultPersonality: UserProfile["personality"] = {
  extroversion: 50,
  openness: 50,
  conscientiousness: 50,
  agreeableness: 50,
  emotionalStability: 50,
};

const defaultAstrology: UserProfile["astrology"] = {
  zodiacSign: "",
  element: "air",
  moonSign: "",
  ascendant: "",
};

const defaultNumerology: UserProfile["numerology"] = {
  lifePath: 1,
  soulUrge: 1,
  destiny: 1,
};

function coerceElement(v: unknown): UserProfile["astrology"]["element"] {
  const s = String(v || "").toLowerCase();
  if (s === "fire" || s === "earth" || s === "air" || s === "water") return s;
  return "air";
}

/** Как на вебе: API профиль → UserProfile для свайпа и совместимости. `apiBase` — для относительных URL фото. */
export function mapApiProfileToUserProfile(p: Profile, apiBase?: string): UserProfile {
  const pers = (p.personality || {}) as Record<string, unknown>;
  const astro = (p.astrology || {}) as Record<string, unknown>;
  const num = (p.numerology || {}) as Record<string, unknown>;

  let photo = p.photo || (p.photos && p.photos[0]) || "";
  if (apiBase && photo) {
    photo = resolveMediaUrl(photo, apiBase) || photo;
  }

  return {
    id: p.id,
    name: p.name,
    age: p.age,
    bio: p.bio || "",
    interests: p.interests ?? [],
    location: p.location ?? "",
    photo,
    personality: {
      extroversion: Number(pers.extroversion ?? defaultPersonality.extroversion),
      openness: Number(pers.openness ?? defaultPersonality.openness),
      conscientiousness: Number(pers.conscientiousness ?? defaultPersonality.conscientiousness),
      agreeableness: Number(pers.agreeableness ?? defaultPersonality.agreeableness),
      emotionalStability: Number(pers.emotionalStability ?? defaultPersonality.emotionalStability),
    },
    astrology: {
      zodiacSign: String(astro.zodiacSign ?? astro.sign ?? defaultAstrology.zodiacSign),
      element: coerceElement(astro.element),
      moonSign: String(astro.moonSign ?? defaultAstrology.moonSign),
      ascendant: String(astro.ascendant ?? defaultAstrology.ascendant),
    },
    numerology: {
      lifePath: Number(num.lifePath ?? num.lifePathNumber ?? defaultNumerology.lifePath),
      soulUrge: Number(num.soulUrge ?? defaultNumerology.soulUrge),
      destiny: Number(num.destiny ?? defaultNumerology.destiny),
    },
    birthDate: p.birthDate || "",
  };
}
