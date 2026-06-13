import type { Rule, Finding, Lang, RuleContext } from "./types";
import { toFinding } from "./types";
import { secretRules } from "./secrets";
import { webRules, pythonRules } from "./web";
import { rustRules } from "./rust";
import { solidityRules } from "./solidity";
import { otherLangRules } from "./other-langs";

export const ALL_RULES: Rule[] = [
  ...secretRules,
  ...webRules,
  ...pythonRules,
  ...rustRules,
  ...solidityRules,
  ...otherLangRules,
];

const EXT_TO_LANG: Record<string, Lang> = {
  js: "js",
  jsx: "js",
  mjs: "js",
  cjs: "js",
  ts: "ts",
  tsx: "ts",
  py: "python",
  rs: "rust",
  sol: "solidity",
  go: "go",
  rb: "ruby",
  php: "php",
  java: "java",
  cs: "csharp",
};

export function detectLang(path: string): Lang | null {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  return EXT_TO_LANG[ext] ?? null;
}

export function langLabel(lang: Lang): string {
  const labels: Record<Lang, string> = {
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
    any: "other",
  };
  return labels[lang];
}

// Which extensions are worth fetching and scanning.
export const SCANNABLE_EXT = new Set(Object.keys(EXT_TO_LANG));

function ruleAppliesToLang(rule: Rule, lang: Lang): boolean {
  return rule.langs.includes("any") || rule.langs.includes(lang);
}

export interface FileScanOutput {
  findings: Finding[];
  rulesConsidered: number; // how many rules ran on this file
  rulesMatched: number;
}

// Scan one file's content. Returns findings (max one per rule per file to keep
// the report readable) and how many rules were checked vs matched.
export function scanFile(ctx: RuleContext): FileScanOutput {
  const lines = ctx.content.split("\n");
  const findings: Finding[] = [];
  const matchedRuleIds = new Set<string>();

  const applicable = ALL_RULES.filter((r) => ruleAppliesToLang(r, ctx.lang));

  for (const rule of applicable) {
    if (matchedRuleIds.has(rule.id)) continue;
    const skipTests = rule.skipTests ?? true;
    if (skipTests && ctx.isTest) continue;

    // custom matcher path
    if (rule.match) {
      if (rule.match(ctx)) {
        findings.push(toFinding(rule, ctx.path, 0, ""));
        matchedRuleIds.add(rule.id);
      }
      continue;
    }

    if (!rule.pattern) continue;

    // find the first matching line for evidence
    for (let i = 0; i < lines.length; i++) {
      if (rule.pattern.test(lines[i])) {
        findings.push(toFinding(rule, ctx.path, i + 1, lines[i]));
        matchedRuleIds.add(rule.id);
        break;
      }
    }
  }

  return {
    findings,
    rulesConsidered: applicable.length,
    rulesMatched: matchedRuleIds.size,
  };
}

// Count of distinct rules that could ever fire, for the "X checks passed" line.
export function totalRuleCount(): number {
  return ALL_RULES.length;
}
