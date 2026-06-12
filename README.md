# 🐑 Shepherd

> You vibe-coded it. Shepherd keeps it alive.

Shepherd is an autonomous maintenance agent for AI-built ("vibe-coded") apps. It scans public GitHub repositories for security issues, gives them a **Survival Score (0–100)**, and produces a plain-English report that any founder can act on.

## What it does

- **Free Survival Scan** — paste any public GitHub repo URL, get a score in ~10 seconds
- **Static analysis** — detects exposed secrets, missing .gitignore entries, risky dependencies, auth without rate limiting, Supabase key exposure, and more
- **Shareable score card** — generated OG image so your result link previews on X/LinkedIn
- **Sample Weekly Report** — see what a Pro report looks like at `/report/demo`

## Tech stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** — minimal, calm design system
- **@vercel/og** — OG image generation
- GitHub REST API (unauthenticated, public repos only)

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

No environment variables are required for the free scan (uses unauthenticated GitHub API).

Optional env vars:
```env
# Add a GitHub token to increase rate limits (60 → 5000 req/hr)
GITHUB_TOKEN=ghp_...

# Future: Anthropic API for smarter AI-generated explanations
ANTHROPIC_API_KEY=sk-ant-...
```

## Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod
```

Or connect the GitHub repo to Vercel for automatic deployments on push.

## Project structure

```
app/
  page.tsx              Landing page with hero, pricing, waitlist
  scan/page.tsx         Scan input + results UI
  report/demo/page.tsx  Static sample weekly report
  api/
    scan/route.ts       POST /api/scan — runs the scanner
    waitlist/route.ts   POST /api/waitlist — captures emails
    og/route.tsx        GET /api/og — OG image for score sharing
lib/
  scanner.ts            Core static analysis engine
```

## Phase 2 roadmap

- **GitHub App install** — access private repos with OAuth
- **Continuous monitoring** — daily scans, email/Slack alerts on new issues
- **Auto-PR fixes** — Shepherd opens a PR with the fix, not just a description
- **Dependency vulnerability tracking** — CVE monitoring via OSV/Snyk
- **AI-powered explanations** — use Claude to generate context-aware fix instructions (stub already in `lib/scanner.ts`)
- **Vercel KV / Supabase** — persistent waitlist and scan history
