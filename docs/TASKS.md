# Implementation tasks

Work **one phase at a time**. After each phase, verify TypeScript compiles before moving on.

Reference docs: [SPEC](./SPEC.md) · [ARCHITECTURE](./ARCHITECTURE.md) · [CHECKS](./CHECKS.md) · [UI](./UI.md) · [ACCEPTANCE](./ACCEPTANCE.md)

---

## Phase 1: Project setup

- [x] Create Next.js app (TypeScript + Tailwind)
- [x] Install: `cheerio`, `fast-xml-parser`, `zod`, `p-limit`
- [x] Basic page layout with title, description, URL input, Run audit button

## Phase 2: Core audit types

- [x] Define `SeoIssue`, `PageAuditResult`, `AuditResult`, `AuditSummary`, `SitemapCoverageResult` in `lib/audit/types.ts`

## Phase 3: URL normalization

- [x] `normalizeUrl(url: string): string`
- [x] `resolveUrl(href: string, baseUrl: string): string | null`
- [x] `isSameOrigin(urlA: string, urlB: string): boolean`
- [x] Safe handling of invalid URLs

## Phase 4: Sitemap parser

- [x] `getSitemapUrlFromInput(inputUrl: string): string`
- [x] `parseSitemap(xml: string): string[]`
- [x] Standard sitemap + sitemap index + nested sitemaps
- [x] Deduplicate normalized URLs

## Phase 5: Fetching

- [x] `fetchUrl(url: string): Promise<FetchResult>`
- [x] Timeout, user-agent, status, final URL, content-type, body
- [x] Safe error handling

## Phase 6: HTML parser

- [x] `parseHtml(html: string, pageUrl: string): ParsedPage`
- [x] Extract: title, meta description, h1s, canonicals, robots meta, internal links

## Phase 7: Page-level checks

- [x] `check-status.ts`
- [x] `check-title.ts`
- [x] `check-meta-description.ts`
- [x] `check-h1.ts`
- [x] `check-canonical.ts`
- [x] `check-robots.ts`
- [x] `check-internal-links.ts`

## Phase 8: Duplicate checks

- [x] Second pass: duplicate titles, meta descriptions, H1s
- [x] Attach issues to affected pages

## Phase 9: Sitemap coverage

- [x] `buildSitemapCoverage(pages, sitemapUrls): SitemapCoverageResult`

## Phase 10: Summary

- [x] `summarize.ts` — totals for pages, errors, warnings, info

## Phase 11: API route

- [x] `POST /api/audit` with zod validation
- [x] `audit-site.ts` orchestrates full pipeline
- [x] JSON success and error responses

## Phase 12: UI results

- [x] `AuditForm.tsx` — submit URL, loading/error states
- [x] `SummaryCards.tsx`
- [x] `PagesTable.tsx` — expandable rows
- [x] `IssuesOverview.tsx`
- [x] `SitemapCoverage.tsx`
- [x] `SeverityBadge.tsx`
- [x] Filters: all / errors / warnings / no issues
- [x] URL search

## Phase 13: Polish

- [x] Empty, error, and loading states
- [x] Responsive layout, URL wrapping, severity colors

## Phase 14: Acceptance verification

- [x] Run through all criteria in [ACCEPTANCE.md](./ACCEPTANCE.md)
