import type { PageAuditResult } from "./types";

const SEVERITY_LABEL: Record<string, string> = {
  error: "ERROR",
  warning: "WARNING",
  info: "INFO",
};

export const buildPagePrompt = (page: PageAuditResult): string => {
  const errors = page.issues.filter((i) => i.severity === "error");
  const warnings = page.issues.filter((i) => i.severity === "warning");
  const infos = page.issues.filter((i) => i.severity === "info");
  const ordered = [...errors, ...warnings, ...infos];

  const issueList = ordered
    .map(
      (issue, idx) =>
        `${idx + 1}. [${SEVERITY_LABEL[issue.severity]}] ${issue.title}\n   ${issue.message}`,
    )
    .join("\n\n");

  const h1Value =
    page.h1s.length > 0 ? page.h1s.map((h) => `"${h}"`).join(", ") : "none";

  const canonical =
    page.canonicalUrls.length > 0 ? page.canonicalUrls.join(", ") : "none";

  const redirect =
    page.finalUrl && page.finalUrl !== page.url
      ? `\nFinal URL (after redirect): ${page.finalUrl}`
      : "";

  return `You are an SEO engineer. Fix the following SEO issues on this Next.js page.

## Page
URL: ${page.url}${redirect}
HTTP status: ${page.statusCode ?? "unknown"}

## Current metadata
Title: ${page.title ? `"${page.title}"` : "none"}
Meta description: ${page.metaDescription ? `"${page.metaDescription}"` : "none"}
H1: ${h1Value}
Canonical: ${canonical}
Robots meta: ${page.robotsMeta ?? "none"}

## Issues to fix (${page.issues.length} total — ${errors.length} error${errors.length !== 1 ? "s" : ""}, ${warnings.length} warning${warnings.length !== 1 ? "s" : ""})

${issueList}

## Instructions
- This project uses Next.js App Router with TypeScript.
- Provide the exact file path and full updated code for every change needed.
- Fix all issues listed above. Do not change anything unrelated.
- Canonicals must match the current environment URL, not a production URL.`;
};
