# Product specification

## Context

Build a **local SEO auditing tool** — a simplified Screaming Frog focused on deterministic technical SEO checks for Next.js websites.

| Constraint | Value |
|------------|-------|
| Runtime | Local only |
| Cost | Free, no paid APIs |
| Users | Single developer |
| Primary target | `http://localhost:3000` and similar dev URLs |

The tool reads a site's sitemap, crawls every URL in it, analyzes each page, and shows a modern HTML report in a local web UI.

**Project status:** Greenfield — start from an empty folder with the simplest robust stack.

## Product goal

Paste a base URL → click **Run audit** → get a full technical SEO report.

**Example input:** `http://localhost:3000`

The app auto-detects the sitemap at `http://localhost:3000/sitemap.xml`. Direct sitemap URLs (e.g. `http://localhost:3000/sitemap.xml`) are also supported.

## Core workflow

1. User opens the local app.
2. User enters a URL.
3. User clicks **Run audit**.
4. App determines whether input is a **base URL** or **sitemap URL**.
5. If base URL → fetch `/sitemap.xml`.
6. Parse sitemap → extract all page URLs.
7. Fetch each page → parse HTML → run SEO checks.
8. Show HTML report in the UI.

## Assumptions

- Target sites are Next.js + React with a valid sitemap.
- Main input is usually the base URL, not the sitemap URL.
- **Canonicals match the current environment** — auditing `http://localhost:3000/about` expects canonical `http://localhost:3000/about`, not production.
- Analyze **raw server-rendered HTML** (no browser rendering in v1).
- No audit history, file export, or Playwright in v1 — in-app HTML report only.

## Non-goals (v1)

Do **not** build:

- User accounts, authentication, database
- Cloud deployment, scheduled audits
- Lighthouse / performance, keywords, backlinks, AI analysis
- Visual regression, Playwright, PDF export, historical comparisons

## URL handling

### Supported inputs

```
http://localhost:3000
http://localhost:3000/
http://localhost:3000/sitemap.xml
https://example.com
https://example.com/sitemap.xml
```

### Normalization rules

Utility must:

- Remove URL hashes
- Normalize trailing slashes
- Keep query params when part of the URL
- Avoid double slashes
- Treat `/about` and `/about/` consistently

**Behavior:** root keeps `/`; non-root URLs remove trailing slash for comparison.

Example: `http://localhost:3000/about/` → `http://localhost:3000/about`

## Sitemap handling

### Standard sitemap

```xml
<urlset>
  <url><loc>http://localhost:3000/</loc></url>
  <url><loc>http://localhost:3000/about</loc></url>
</urlset>
```

### Sitemap index

```xml
<sitemapindex>
  <sitemap><loc>http://localhost:3000/sitemap-0.xml</loc></sitemap>
</sitemapindex>
```

When a sitemap index is found:

1. Fetch each nested sitemap
2. Extract URLs from each
3. Merge and deduplicate (normalized)

### Sitemap errors

Show friendly errors when:

- Sitemap cannot be fetched
- Non-200 response
- Invalid XML
- No URLs found

For **nested sitemap failures**: do not fail the entire audit — add an audit-level warning and continue with sitemaps that worked.

## Crawling behavior

For every sitemap URL:

1. Fetch URL
2. Record status code, final URL after redirects, fetch errors
3. Parse HTML only if response is HTML
4. Run SEO checks

| Setting | Default |
|---------|---------|
| Concurrency | `5` (internal constant) |
| Timeout | `15000` ms |
| User-Agent | `local-seo-auditor/1.0` |

## Internal link discovery (v1)

While parsing each page:

1. Extract all `<a href="">` links
2. Keep same-origin internal links only
3. Normalize URLs
4. Compare against sitemap URLs

**Report:**

- Internal URLs linked but missing from sitemap
- Sitemap URLs not discovered via internal links

**Do not** recursively crawl discovered URLs in v1 — report differences only.

## Future improvements (not v1)

- Playwright / browser-rendered mode
- CSV / JSON / PDF export
- Saved audit history, compare two audits
- robots.txt, image alt, Open Graph / Twitter, structured data, hreflang
- Performance checks, CLI mode, GitHub Actions / CI mode
