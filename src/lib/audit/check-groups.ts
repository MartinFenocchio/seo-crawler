import type { AuditSummary, PageAuditResult } from "./types";

export type CheckGroup = {
  id: string;
  label: string;
  description: string;
  issueTypes: string[];
};

export const CHECK_GROUPS: CheckGroup[] = [
  {
    id: "status",
    label: "HTTP Status",
    description: "Fetch errors, 4xx/5xx responses, redirects",
    issueTypes: ["fetch-failed", "http-error", "http-redirect", "url-redirect", "non-html"],
  },
  {
    id: "metadata",
    label: "Metadata",
    description: "Page title and meta description",
    issueTypes: [
      "missing-title", "empty-title", "long-title", "duplicate-title",
      "missing-meta-description", "empty-meta-description", "duplicate-meta-description",
    ],
  },
  {
    id: "headings",
    label: "Headings",
    description: "H1 tag presence and uniqueness",
    issueTypes: ["missing-h1", "multiple-h1", "empty-h1", "duplicate-h1"],
  },
  {
    id: "canonical",
    label: "Canonical",
    description: "Canonical tag presence and correctness",
    issueTypes: [
      "missing-canonical", "multiple-canonical", "empty-canonical",
      "invalid-canonical", "relative-canonical", "canonical-mismatch",
      "canonical-hash", "canonical-different-origin", "canonical-unexpected-query",
    ],
  },
  {
    id: "indexability",
    label: "Indexability",
    description: "Robots meta and robots.txt directives",
    issueTypes: [
      "robots-noindex", "sitemap-noindex", "robots-nofollow",
      "robots-txt-missing", "robots-txt-disallow-all",
    ],
  },
  {
    id: "social",
    label: "Open Graph",
    description: "og:title, og:description, and og:image tags",
    issueTypes: ["missing-og-title", "missing-og-description", "missing-og-image"],
  },
  {
    id: "links",
    label: "Internal Links",
    description: "Broken and redirecting internal links",
    issueTypes: ["broken-internal-link", "redirected-internal-link"],
  },
  {
    id: "images",
    label: "Images",
    description: "Missing alt text on images",
    issueTypes: ["missing-alt"],
  },
];

export type CheckConfig = Record<string, boolean>;

export const defaultCheckConfig = (): CheckConfig =>
  Object.fromEntries(CHECK_GROUPS.map((g) => [g.id, true]));

export const isIssueVisible = (issueType: string, config: CheckConfig): boolean => {
  const group = CHECK_GROUPS.find((g) => g.issueTypes.includes(issueType));
  if (!group) return true; // unknown types always shown
  return config[group.id] !== false;
};

export const filterVisibleIssues = <T extends { type: string }>(
  issues: T[],
  config: CheckConfig,
): T[] => issues.filter((i) => isIssueVisible(i.type, config));

export const computeSummary = (
  pages: PageAuditResult[],
  config: CheckConfig,
): AuditSummary => {
  let pagesWithErrors = 0;
  let pagesWithWarnings = 0;
  let totalErrors = 0;
  let totalWarnings = 0;
  let totalInfo = 0;

  for (const page of pages) {
    const visible = filterVisibleIssues(page.issues, config);
    const errors = visible.filter((i) => i.severity === "error").length;
    const warnings = visible.filter((i) => i.severity === "warning").length;
    const infos = visible.filter((i) => i.severity === "info").length;

    totalErrors += errors;
    totalWarnings += warnings;
    totalInfo += infos;

    if (errors > 0) pagesWithErrors += 1;
    if (warnings > 0) pagesWithWarnings += 1;
  }

  return {
    totalPages: pages.length,
    pagesWithErrors,
    pagesWithWarnings,
    totalErrors,
    totalWarnings,
    totalInfo,
  };
};
