// ── Rule engine types ──────────────────────────────────────────────────────
// Every finding carries evidence (file + line + redacted excerpt) so no one can
// wave it away as "just an AI guessing". Tone everywhere: plain and a little
// playful. No long dashes, no five-dollar words.

import type { Issue, IssueSeverity, IssueCategory } from "@/lib/scanner-types";

export type Confidence = "high" | "medium" | "low";

export type Lang =
  | "js"
  | "ts"
  | "python"
  | "rust"
  | "solidity"
  | "go"
  | "ruby"
  | "php"
  | "java"
  | "csharp"
  | "any";

export interface RuleContext {
  path: string;
  content: string;
  lang: Lang;
  isTest: boolean;
  // whole-repo facts a rule might want
  allPaths: Set<string>;
}

export interface Finding {
  ruleId: string;
  severity: IssueSeverity;
  category: IssueCategory;
  title: string;
  roast: string; // one short funny line
  plain: string; // what it means, in plain words
  fix: string; // copy-pasteable steps
  confidence: Confidence;
  reference?: string; // OWASP / CWE / docs link
  // filled in by the engine:
  file?: string;
  line?: number;
  excerpt?: string;
}

export interface Rule {
  id: string;
  langs: Lang[]; // which languages this rule runs on ("any" = all)
  severity: IssueSeverity;
  category: IssueCategory;
  title: string;
  roast: string;
  plain: string;
  fix: string;
  confidence: Confidence;
  reference?: string;
  // a rule matches by regex (most common) or a custom function
  pattern?: RegExp;
  // skip in test/example files? defaults true
  skipTests?: boolean;
  // custom matcher for the rare rule that needs more than a regex
  match?: (ctx: RuleContext) => boolean;
}

// Turn a matched rule + its location into a Finding with redacted evidence.
export function toFinding(
  rule: Rule,
  path: string,
  lineNumber: number,
  rawLine: string
): Finding {
  return {
    ruleId: rule.id,
    severity: rule.severity,
    category: rule.category,
    title: rule.title,
    roast: rule.roast,
    plain: rule.plain,
    fix: rule.fix,
    confidence: rule.confidence,
    reference: rule.reference,
    file: path,
    line: lineNumber,
    excerpt: redact(rawLine.trim()).slice(0, 160),
  };
}

// Mask anything that looks like a secret so we never echo a live key back.
export function redact(line: string): string {
  return line
    // long base64-ish / hex blobs
    .replace(/([A-Za-z0-9_\-]{8})[A-Za-z0-9_\-]{12,}/g, "$1\u2022\u2022\u2022\u2022\u2022\u2022")
    // anything after = inside quotes that's long
    .replace(/(["'])[A-Za-z0-9_\-+/]{20,}\1/g, "$1\u2022\u2022\u2022\u2022\u2022\u2022$1");
}

// Convert a Finding into the Issue shape the UI already renders.
export function findingToIssue(f: Finding): Issue {
  const where = f.file ? (f.line ? `${f.file}:${f.line}` : f.file) : undefined;
  return {
    severity: f.severity,
    category: f.category,
    title: f.title,
    roast: f.roast,
    description: buildDescription(f),
    fix: f.fix,
    file: where,
  };
}

function buildDescription(f: Finding): string {
  const bits: string[] = [f.plain];
  if (f.excerpt) bits.push(`\nFound here: ${f.excerpt}`);
  bits.push(`\nHow sure are we: ${confidenceWord(f.confidence)}.`);
  if (f.reference) bits.push(`More reading: ${f.reference}`);
  return bits.join("\n");
}

function confidenceWord(c: Confidence): string {
  if (c === "high") return "pretty sure";
  if (c === "medium") return "fairly sure, worth a look";
  return "might be fine, check it yourself";
}

export type { Issue, IssueSeverity, IssueCategory };
