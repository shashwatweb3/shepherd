import { ALL_RULES } from "@/lib/rules/engine";
import type { Lang } from "@/lib/rules/types";

// Built straight from the real rules the scanner runs, so the docs page can
// never claim a check that does not exist.

const CATEGORY_LABEL: Record<string, string> = {
  secrets: "Secrets",
  dependencies: "Dependencies",
  auth: "Login & sessions",
  security: "Code security",
  supabase: "Supabase",
  "smart-contract": "Smart contracts (Solidity)",
  "memory-safety": "Memory safety (Rust)",
  "repo-health": "Repo basics",
  "code-quality": "Code quality",
};

const LANG_LABEL: Record<Lang, string> = {
  js: "JavaScript",
  ts: "TypeScript",
  python: "Python",
  rust: "Rust",
  solidity: "Solidity",
  go: "Go",
  ruby: "Ruby",
  php: "PHP",
  java: "Java",
  csharp: "C#",
  any: "any language",
};

export interface DocRule {
  id: string;
  category: string;
  severity: string;
  confidence: string;
  langs: string;
  title: string;
  plain: string;
  fix: string;
  reference?: string;
}

export const DOC_RULES: DocRule[] = ALL_RULES.map((r) => ({
  id: r.id,
  category: CATEGORY_LABEL[r.category] ?? r.category,
  severity: r.severity,
  confidence: r.confidence,
  langs: r.langs.map((l) => LANG_LABEL[l]).join(", "),
  title: r.title,
  plain: r.plain,
  fix: r.fix,
  reference: r.reference,
})).sort((a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title));

export const DOC_CATEGORIES = Array.from(new Set(DOC_RULES.map((r) => r.category))).sort();
export const RULE_COUNT = DOC_RULES.length;
export const SUPPORTED_LANGS = ["JavaScript", "TypeScript", "Python", "Rust", "Solidity", "Go", "Ruby", "PHP", "Java"];
