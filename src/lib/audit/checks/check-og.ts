import type { ParsedPage, SeoIssue } from "../types";
import { createIssue } from "./create-issue";

export const checkOg = (parsedPage: ParsedPage): SeoIssue[] => {
  const issues: SeoIssue[] = [];

  if (!parsedPage.ogTitle) {
    issues.push(
      createIssue(
        "missing-og-title",
        "warning",
        "Missing og:title",
        "The page is missing a <meta property=\"og:title\"> tag.",
      ),
    );
  }

  if (!parsedPage.ogDescription) {
    issues.push(
      createIssue(
        "missing-og-description",
        "warning",
        "Missing og:description",
        "The page is missing a <meta property=\"og:description\"> tag.",
      ),
    );
  }

  if (!parsedPage.ogImage) {
    issues.push(
      createIssue(
        "missing-og-image",
        "warning",
        "Missing og:image",
        "The page is missing a <meta property=\"og:image\"> tag.",
      ),
    );
  }

  return issues;
};
