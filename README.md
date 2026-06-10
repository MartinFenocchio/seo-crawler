# Local SEO Auditor

A local-only technical SEO auditing tool for Next.js sites. Paste a URL, crawl the sitemap, get a deterministic SEO report.

## Specification-driven development (SDD)

This project uses **SDD**: the spec lives in `docs/` and implementation follows phased tasks.

```
docs/
  SPEC.md          # What we're building (product + crawl behavior)
  ARCHITECTURE.md  # Stack, types, API, file structure
  CHECKS.md        # All SEO rules and severities
  UI.md            # UI components and layout
  TASKS.md         # Phased checklist — work here phase by phase
  ACCEPTANCE.md    # Definition of done
```

### How to build with Cursor

1. Say: **"Implement Phase N from docs/TASKS.md"**
2. The `.cursor/rules/seo-auditor.mdc` rule keeps the agent aligned with the spec.
3. After each phase, tasks are checked off in `docs/TASKS.md`.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Original plan

The raw product brief is preserved in [`plan.md`](./plan.md). Structured docs in `docs/` are the maintained source of truth.
