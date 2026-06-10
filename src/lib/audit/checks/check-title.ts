import type { ParsedPage } from "../types";
import { createIssue } from "./create-issue";
import type { SeoIssue } from "../types";

export const checkTitle = (parsedPage: ParsedPage): SeoIssue[] => {
  const issues: SeoIssue[] = [];
  const title = parsedPage.title;

  if (title === null) {
    issues.push(
      createIssue(
        "missing-title",
        "error",
        "Missing title",
        "The page is missing a <title> element.",
      ),
    );
    return issues;
  }

  if (title.length === 0) {
    issues.push(
      createIssue(
        "empty-title",
        "error",
        "Empty title",
        "The page <title> element is empty.",
      ),
    );
    return issues;
  }

  if (title.length > 60) {
    issues.push(
      createIssue(
        "long-title",
        "warning",
        "Long title",
        `Title is ${title.length} characters (recommended maximum: 60).`,
      ),
    );
  }

  return issues;
};
