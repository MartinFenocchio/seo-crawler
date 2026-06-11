import type { ParsedPage, SeoIssue } from "../types";
import { createIssue } from "./create-issue";

export const checkImages = (parsedPage: ParsedPage): SeoIssue[] => {
  const issues: SeoIssue[] = [];

  for (const image of parsedPage.images) {
    if (image.alt === null) {
      const label = image.src ? `<img src="${image.src}">` : "An <img> element";
      issues.push(
        createIssue(
          "missing-alt",
          "warning",
          "Missing alt text",
          `${label} is missing an alt attribute.`,
        ),
      );
    }
  }

  return issues;
};
