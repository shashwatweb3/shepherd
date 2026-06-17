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
    roast: "Okay, show off. We went looking for problems and came back empty.",
    bg: "#F0FDF4",
    border: "#BBF7D0",
  },
  "mostly-alive": {
    label: "Mostly Alive",
    color: "#16A34A",
    mood: "happy",
    roast: "Pretty solid. A couple of small things to clean up when you get a minute.",
    bg: "#F0FDF4",
    border: "#BBF7D0",
  },
  limping: {
    label: "Limping Along",
    color: "#D97706",
    mood: "nervous",
    roast: "It works, but you've been ignoring some stuff. Worth a weekend.",
    bg: "#FFFBEB",
    border: "#FDE68A",
  },
  "one-deploy": {
    label: "One Deploy From Disaster",
    color: "#EA580C",
    mood: "nervous",
    roast: "This is held together with hope and duct tape. Fix the red ones today.",
    bg: "#FFF7ED",
    border: "#FDBA74",
  },
  "call-the-vet": {
    label: "Call the Vet",
    color: "#DC2626",
    mood: "critical",
    roast: "Yeah, this needs work. Start at the top of the list, you've got this.",
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
