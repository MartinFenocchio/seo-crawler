import type { ParsedPage } from "../types";
import { createIssue } from "./create-issue";
import type { SeoIssue } from "../types";

export const checkMetaDescription = (parsedPage: ParsedPage): SeoIssue[] => {
  const issues: SeoIssue[] = [];
  const description = parsedPage.metaDescription;

  if (description === null) {
    issues.push(
      createIssue(
        "missing-meta-description",
        "warning",
        "Missing meta description",
        'The page is missing a <meta name="description"> tag.',
      ),
    );
    return issues;
  }

  if (description.length === 0) {
    issues.push(
      createIssue(
        "empty-meta-description",
        "warning",
        "Empty meta description",
        'The <meta name="description"> content is empty.',
      ),
    );
    return issues;
  }

  return issues;
};
