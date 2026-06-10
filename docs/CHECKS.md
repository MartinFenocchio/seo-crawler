# SEO checks (v1)

Each check returns structured `SeoIssue` objects. See [ARCHITECTURE.md](./ARCHITECTURE.md) for the type definition.

Duplicate checks (title, meta description, H1) require a **second pass** after all pages are analyzed.

---

## 1. HTTP status

| Condition | Severity |
|-----------|----------|
| Fetch failed | error |
| Status 4xx or 5xx | error |
| Status 3xx | warning |
| Final URL differs from original | info |

Examples: `Page returned 404.` · `Page redirected from /about to /about-us.`

## 2. HTML content

| Condition | Severity |
|-----------|----------|
| Response is not HTML | warning |

Example: `The URL did not return HTML content and could not be analyzed.`

## 3. Title (`<title>` in `<head>`)

| Condition | Severity |
|-----------|----------|
| Missing | error |
| Empty | error |
| Shorter than 10 chars | warning |
| Longer than 60 chars | warning |
| Duplicated across pages | warning (second pass) |

## 4. Meta description

```html
<meta name="description" content="..." />
```

| Condition | Severity |
|-----------|----------|
| Missing | warning |
| Empty | warning |
| Shorter than 50 chars | warning |
| Longer than 160 chars | warning |
| Duplicated across pages | warning (second pass) |

## 5. H1

| Condition | Severity |
|-----------|----------|
| No H1 | error |
| More than one H1 | error |
| H1 text empty | error |
| Duplicated across pages | warning (second pass) |

## 6. Canonical

```html
<link rel="canonical" href="..." />
```

| Condition | Severity |
|-----------|----------|
| Missing | error |
| More than one | error |
| Empty href | error |
| Invalid URL | error |
| Relative URL | warning |
| Does not match expected URL for current environment | warning |
| Different origin | warning |
| Contains hash | warning |
| Unexpected query params | warning |

**Expected canonical** = the audited page URL in the current environment.

- `http://localhost:3000/about` → expected `http://localhost:3000/about`
- `https://staging.example.com/about` → expected `https://staging.example.com/about`

Do not compare against production unless auditing production.

## 7. Robots meta

```html
<meta name="robots" content="noindex" />
```

| Condition | Severity |
|-----------|----------|
| `noindex` present | warning |
| `nofollow` present | info |
| In sitemap but has `noindex` | warning |

## 8. Internal links

Extract from `<a href="">`. **Ignore:** `mailto:`, `tel:`, `javascript:`, empty href, hash-only href.

Normalize relative URLs; keep same-origin only.

| Condition | Severity |
|-----------|----------|
| Link points to URL that returned 4xx/5xx (if crawled) | warning |
| Link points to redirected URL (if crawled) | info |

v1 does not fetch URLs outside the sitemap. Broken-link checks apply only to links whose targets were also crawled. Others appear in sitemap coverage only.

## 9. Sitemap coverage (global)

Compare sitemap URLs vs discovered internal links.

| Condition | Severity |
|-----------|----------|
| Internal URL missing from sitemap | warning |
| Sitemap URL not discovered via internal links | info |

Implemented in `buildSitemapCoverage()`, not per-page checks.
