import type { ParsedPage } from "../types";
import { createIssue } from "./create-issue";
import type { SeoIssue } from "../types";

export const checkH1 = (parsedPage: ParsedPage): SeoIssue[] => {
  const issues: SeoIssue[] = [];
  const h1s = parsedPage.h1s;

  if (h1s.length === 0) {
    issues.push(
      createIssue(
        "missing-h1",
        "error",
        "Missing H1",
        "The page has no <h1> element.",
      ),
    );
    return issues;
  }

  if (h1s.length > 1) {
    issues.push(
      createIssue(
        "multiple-h1",
        "error",
        "Multiple H1",
        `The page has ${h1s.length} <h1> elements.`,
      ),
    );
  }

  if (h1s.some((h1) => h1.length === 0)) {
    issues.push(
      createIssue(
        "empty-h1",
        "error",
        "Empty H1",
        "The page has an <h1> element with no text.",
      ),
    );
  }

  return issues;
};
