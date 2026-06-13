import type { ScoreTier } from "@/lib/tiers";

export type IssueSeverity = "critical" | "medium" | "low";

export type IssueCategory =
  | "secrets"
  | "dependencies"
  | "auth"
  | "security"
  | "supabase"
  | "smart-contract"
  | "memory-safety"
  | "repo-health"
  | "code-quality";

export interface Issue {
  severity: IssueSeverity;
  title: string;
  roast: string;
  description: string;
  fix: string;
  file?: string;
  category: IssueCategory;
}

export interface ScanResult {
  repo: string;
  score: number;
  tier: ScoreTier;
  issues: Issue[];
  scannedAt: string;
  filesChecked: number;
  linesChecked: number;
  rulesRun: number;
  checksPassed: number;
  languages: string[];
}
