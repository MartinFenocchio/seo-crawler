# Architecture

## Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js App Router |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Server | Node.js route handlers |
| HTML parsing | Cheerio |
| Sitemap XML | fast-xml-parser |
| Validation | zod |
| Concurrency | p-limit |

**Excluded:** paid APIs, login, accounts, database, auth, cloud deployment.

## Constants

```ts
const CONCURRENCY_LIMIT = 5;
const REQUEST_TIMEOUT_MS = 15_000;
const USER_AGENT = "local-seo-auditor/1.0";
```

## Data types

```ts
type SeoIssue = {
  id: string;
  type: string;
  severity: "error" | "warning" | "info";
  title: string;
  message: string;
};

type PageAuditResult = {
  url: string;
  normalizedUrl: string;
  statusCode: number | null;
  finalUrl: string | null;
  title: string | null;
  metaDescription: string | null;
  h1s: string[];
  canonicalUrls: string[];
  robotsMeta: string | null;
  internalLinks: string[];
  issues: SeoIssue[];
};

type AuditSummary = {
  totalPages: number;
  pagesWithErrors: number;
  pagesWithWarnings: number;
  totalErrors: number;
  totalWarnings: number;
  totalInfo: number;
};

type SitemapCoverageResult = {
  sitemapUrls: string[];
  discoveredInternalUrls: string[];
  internalUrlsMissingFromSitemap: string[];
  sitemapUrlsNotDiscoveredInternally: string[];
};

type AuditResult = {
  inputUrl: string;
  baseUrl: string;
  sitemapUrl: string | null;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  summary: AuditSummary;
  pages: PageAuditResult[];
  sitemapCoverage: SitemapCoverageResult;
  auditWarnings: SeoIssue[];
};
```

## API

### `POST /api/audit`

**Request:**

```json
{ "url": "http://localhost:3000" }
```

**Success response:** full `AuditResult` JSON.

**Error response:**

```json
{ "error": "Could not fetch sitemap", "details": "..." }
```

Validate input with zod.

## File structure

```
src/
  app/
    page.tsx
    api/
      audit/
        route.ts
  components/
    AuditForm.tsx
    AuditResults.tsx
    SummaryCards.tsx
    PagesTable.tsx
    IssuesOverview.tsx
    SitemapCoverage.tsx
    SeverityBadge.tsx
  lib/
    audit/
      audit-site.ts
      fetch-url.ts
      parse-sitemap.ts
      parse-html.ts
      checks/
        check-status.ts
        check-title.ts
        check-meta-description.ts
        check-h1.ts
        check-canonical.ts
        check-robots.ts
        check-internal-links.ts
        check-duplicates.ts
      types.ts
      normalize-url.ts
      summarize.ts
```

## Core modules

| Module | Responsibility |
|--------|----------------|
| `normalize-url.ts` | `normalizeUrl`, `resolveUrl`, `isSameOrigin` |
| `parse-sitemap.ts` | `getSitemapUrlFromInput`, `parseSitemap` |
| `fetch-url.ts` | `fetchUrl` → status, final URL, content-type, body |
| `parse-html.ts` | `parseHtml` → title, meta, h1s, canonicals, robots, links |
| `checks/*` | One function per check, returns `SeoIssue[]` |
| `check-duplicates.ts` | Second-pass duplicate title / description / H1 |
| `audit-site.ts` | Orchestrates full audit pipeline |
| `summarize.ts` | Builds `AuditSummary` and coverage |

## Design principles

- One concern per file — no monolithic audit logic
- Checks are deterministic and independently testable
- Correctness of audit logic > visual polish
- TypeScript must compile after each phase
