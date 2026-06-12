export type VibeMood = "crowned" | "happy" | "nervous" | "critical" | "scanning" | "sleeping";
export type ScoreTier = "immortal" | "mostly-alive" | "limping" | "one-deploy" | "call-the-vet";

export interface TierData {
  label: string;
  color: string;
  mood: VibeMood;
  roast: string;
  bg: string;
  border: string;
}

export const TIERS: Record<ScoreTier, TierData> = {
  immortal: {
    label: "Immortal Sheep",
    color: "#16A34A",
    mood: "crowned",
    roast: "We have no notes. Annoyingly impressive.",
    bg: "#F0FDF4",
    border: "#BBF7D0",
  },
  "mostly-alive": {
    label: "Mostly Alive",
    color: "#16A34A",
    mood: "happy",
    roast: "Good shape. A few loose threads, but nothing's on fire.",
    bg: "#F0FDF4",
    border: "#BBF7D0",
  },
  limping: {
    label: "Limping Along",
    color: "#D97706",
    mood: "nervous",
    roast: "It runs. Barely. Like a three-legged sheep.",
    bg: "#FFFBEB",
    border: "#FDE68A",
  },
  "one-deploy": {
    label: "One Deploy From Disaster",
    color: "#EA580C",
    mood: "nervous",
    roast: "One bad push from becoming someone else's problem.",
    bg: "#FFF7ED",
    border: "#FDBA74",
  },
  "call-the-vet": {
    label: "Call the Vet",
    color: "#DC2626",
    mood: "critical",
    roast: "The sheep has seen better days. Many better days.",
    bg: "#FEF2F2",
    border: "#FECACA",
  },
};

export function getTier(score: number): ScoreTier {
  if (score >= 90) return "immortal";
  if (score >= 70) return "mostly-alive";
  if (score >= 50) return "limping";
  if (score >= 30) return "one-deploy";
  return "call-the-vet";
}

// Flat maps derived from TIERS — used by scan page, wall page, OG route
export const TIER_COLORS: Record<ScoreTier, string> = Object.fromEntries(
  Object.entries(TIERS).map(([k, v]) => [k, v.color])
) as Record<ScoreTier, string>;

export const TIER_LABELS: Record<ScoreTier, string> = {
  immortal: "Immortal Sheep",
  "mostly-alive": "Mostly Alive",
  limping: "Limping Along",
  "one-deploy": "One Deploy From Disaster",
  "call-the-vet": "Call the Vet",
};
