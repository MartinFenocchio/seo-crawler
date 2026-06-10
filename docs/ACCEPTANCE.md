# Acceptance criteria

The app is **complete** when all items pass.

## Run locally

1. [x] App starts with `npm run dev`
2. [x] Works fully locally with no paid/external APIs

## Sitemap & crawl

3. [x] Entering `http://localhost:3000` finds `http://localhost:3000/sitemap.xml`
4. [x] All sitemap URLs are read and fetched

## SEO detection

5. [x] Detects missing H1
6. [x] Detects multiple H1s
7. [x] Detects missing title
8. [x] Detects missing meta description
9. [x] Detects missing canonical
10. [x] Detects wrong canonical for localhost
11. [x] Detects noindex pages

## Report UI

12. [x] Clean, scannable HTML report
13. [x] Issues grouped by type
14. [x] Page-by-page table with expandable rows
15. [x] Filters for errors and warnings
16. [x] Sitemap coverage section

## Code quality

17. [x] Modular structure — easy to extend
18. [x] No database, auth, or Playwright in v1
