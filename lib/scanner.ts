// Barrel file. The real engine lives in scanner-core.ts + lib/rules/*.
// Kept so existing imports from "@/lib/scanner" keep working.
export type { ScoreTier } from "@/lib/tiers";
export { getTier, TIER_LABELS, TIER_COLORS } from "@/lib/tiers";
export type { Issue, IssueSeverity, IssueCategory, ScanResult } from "@/lib/scanner-types";
export { scanRepo } from "@/lib/scanner-core";
