# UI specification

## Design direction

- Modern SaaS dashboard aesthetic
- Clean cards, soft borders, light background
- Strong typography, responsive layout
- Tailwind only — no default browser styling

## Main page

| Element | Content |
|---------|---------|
| Title | Local SEO Auditor |
| Description | Short intro text |
| Input | URL field |
| Primary action | **Run audit** button |
| States | Loading, error, results |

## Loading state

- Spinner or progress indicator
- Text: e.g. "Auditing pages…"
- Note that audit may take a few seconds

Live per-page progress is **not** required for v1.

## Results summary (top)

Summary cards:

- Total pages
- Pages with errors
- Pages with warnings
- Total errors
- Total warnings
- Audit duration

Use visual severity indicators.

Example: `40 pages analyzed · 3 pages with errors · 8 warnings · Finished in 7.4s`

## Page results table

One row per page.

| Column | Content |
|--------|---------|
| URL | Page URL |
| Status | HTTP status |
| Title | `<title>` value |
| H1 count | Number of H1s |
| Canonical status | Summary indicator |
| Issues count | Total issues |
| Severity | Highest severity on page |

**Expandable rows** show:

- All issues
- Title, meta description, H1 values
- Canonical values, robots meta
- Internal links count

## Filtering

- All · Errors · Warnings · No issues
- Text search by URL

## Issues overview

Grouped by issue type, e.g.:

```
Missing H1: 2 pages
Multiple H1: 1 page
Missing meta description: 5 pages
Canonical mismatch: 3 pages
```

Clicking an issue type may filter the table (optional — static overview is acceptable).

## Sitemap coverage section

Title: **Sitemap coverage**

Lists:

- Internal URLs missing from sitemap
- Sitemap URLs not found in internal links

Positive empty state when no coverage issues.

## Polish (Phase 13)

- Empty states, error states, loading states
- Responsive layout, long URL wrapping
- Severity badges and color coding
- Clear, scannable messages
