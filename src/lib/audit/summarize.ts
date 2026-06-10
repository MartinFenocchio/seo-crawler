import type { AuditSummary, PageAuditResult } from "./types";

export const buildSummary = (pages: PageAuditResult[]): AuditSummary => {
  let pagesWithErrors = 0;
  let pagesWithWarnings = 0;
  let totalErrors = 0;
  let totalWarnings = 0;
  let totalInfo = 0;

  for (const page of pages) {
    const errorCount = page.issues.filter(
      (issue) => issue.severity === "error",
    ).length;
    const warningCount = page.issues.filter(
      (issue) => issue.severity === "warning",
    ).length;
    const infoCount = page.issues.filter(
      (issue) => issue.severity === "info",
    ).length;

    totalErrors += errorCount;
    totalWarnings += warningCount;
    totalInfo += infoCount;

    if (errorCount > 0) {
      pagesWithErrors += 1;
    }

    if (warningCount > 0) {
      pagesWithWarnings += 1;
    }
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
