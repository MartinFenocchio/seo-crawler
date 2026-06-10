# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # start dev server at http://localhost:3000
npm run build    # production build (TypeScript must compile)
npm run lint     # ESLint
```

No test runner is configured — verify logic by running the dev server and calling `POST /api/audit`.

## Architecture

This is a local-only SEO auditing tool: the user pastes a URL, the server crawls the sitemap, analyzes each page, and returns a full `AuditResult` JSON. There is no database, auth, or cloud deployment.

### Data flow

```
POST /api/audit  →  audit-site.ts  →  parse-sitemap.ts  →  fetch-url.ts (×N, concurrency 5)
                                   →  parse-html.ts     →  checks/*
                                   →  check-duplicates.ts (second pass)
                                   →  buildSitemapCoverage()
                                   →  summarize.ts
                                   →  AuditResult JSON
```

### Key modules under `src/lib/audit/`

| File | Purpose |
|------|---------|
| `types.ts` | All shared types: `SeoIssue`, `PageAuditResult`, `AuditResult`, etc. |
| `audit-site.ts` | Top-level orchestrator — drives the full pipeline |
| `fetch-url.ts` | `fetchUrl()` — timeout 15s, User-Agent `local-seo-auditor/1.0`, returns status/finalUrl/body |
| `parse-sitemap.ts` | Handles standard sitemaps and sitemap indexes (nested fetch + merge) |
| `parse-html.ts` | Extracts title, meta description, H1s, canonicals, robots meta, internal links |
| `normalize-url.ts` | `normalizeUrl`, `resolveUrl`, `isSameOrigin` |
| `summarize.ts` | Builds `AuditSummary` and `SitemapCoverageResult` |
| `checks/*.ts` | One file per SEO check; each returns `SeoIssue[]` |

### SEO checks

Each check lives in its own file under `src/lib/audit/checks/`. The full rules and severities are specified in [`docs/CHECKS.md`](docs/CHECKS.md). Duplicate checks (title, meta description, H1) are a **second pass** in `check-duplicates.ts` after all pages are fetched.

### UI components (`src/components/`)

`AuditApp.tsx` is the top-level client component that owns state. It renders `AuditForm` (input + loading/error states) and `AuditResults` (summary cards, pages table, issues overview, sitemap coverage).

### API

`POST /api/audit` — body `{ "url": "..." }` validated with zod. Returns full `AuditResult` or `{ "error": "...", "details": "..." }`.

## Specification docs

The `docs/` folder is the source of truth. Consult before changing behavior:

- [`docs/SPEC.md`](docs/SPEC.md) — product behavior, URL/sitemap/crawl rules
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — stack, types, API contract, file structure
- [`docs/CHECKS.md`](docs/CHECKS.md) — SEO rules and severity levels
- [`docs/UI.md`](docs/UI.md) — component layout
- [`docs/TASKS.md`](docs/TASKS.md) — phased implementation checklist (all phases complete)
- [`docs/ACCEPTANCE.md`](docs/ACCEPTANCE.md) — definition of done

## Hard constraints

- No database, auth, Playwright, AI APIs, or paid services
- Analyze raw server-rendered HTML only (no browser rendering)
- Canonical checks must match the **audited environment** — `http://localhost:3000/about` expects canonical `http://localhost:3000/about`, not a production URL
- Concurrency: 5 · Timeout: 15 s · User-Agent: `local-seo-auditor/1.0`
- Dependencies: `cheerio`, `fast-xml-parser`, `zod`, `p-limit` — no new packages without strong justification
