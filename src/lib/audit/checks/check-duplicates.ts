import type { PageAuditResult } from "../types";
import { createIssue } from "./create-issue";

type DuplicateField = "title" | "metaDescription" | "h1";

const duplicateConfig: Record<
  DuplicateField,
  {
    type: string;
    title: string;
    getValue: (page: PageAuditResult) => string | null;
    message: (value: string, count: number) => string;
  }
> = {
  title: {
    type: "duplicate-title",
    title: "Duplicate title",
    getValue: (page) => page.title,
    message: (value, count) =>
      `Title "${value}" is used on ${count} pages.`,
  },
  metaDescription: {
    type: "duplicate-meta-description",
    title: "Duplicate meta description",
    getValue: (page) => page.metaDescription,
    message: (value, count) =>
      `Meta description "${value.slice(0, 80)}${value.length > 80 ? "…" : ""}" is used on ${count} pages.`,
  },
  h1: {
    type: "duplicate-h1",
    title: "Duplicate H1",
    getValue: (page) => page.h1s[0] ?? null,
    message: (value, count) =>
      `H1 "${value}" is used on ${count} pages.`,
  },
};

const applyDuplicateIssues = (
  pages: PageAuditResult[],
  field: DuplicateField,
): void => {
  const config = duplicateConfig[field];
  const groups = new Map<string, PageAuditResult[]>();

  for (const page of pages) {
    const value = config.getValue(page);

    if (!value || value.length === 0) {
      continue;
    }

    const normalizedValue = value.trim().toLowerCase();
    const existing = groups.get(normalizedValue) ?? [];
    existing.push(page);
    groups.set(normalizedValue, existing);
  }

  for (const [, groupedPages] of groups) {
    if (groupedPages.length < 2) {
      continue;
    }

    const displayValue = config.getValue(groupedPages[0]) ?? "";

    for (const page of groupedPages) {
      page.issues.push(
        createIssue(
          config.type,
          "warning",
          config.title,
          config.message(displayValue, groupedPages.length),
        ),
      );
    }
  }
};

export const applyDuplicateChecks = (pages: PageAuditResult[]): void => {
  applyDuplicateIssues(pages, "title");
  applyDuplicateIssues(pages, "metaDescription");
  applyDuplicateIssues(pages, "h1");
};
