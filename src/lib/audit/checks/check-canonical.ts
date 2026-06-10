import { isSameOrigin, normalizeUrl } from "../normalize-url";
import type { ParsedPage } from "../types";
import { createIssue } from "./create-issue";
import type { SeoIssue } from "../types";

export const checkCanonical = (
  parsedPage: ParsedPage,
  pageUrl: string,
): SeoIssue[] => {
  const issues: SeoIssue[] = [];
  const expectedCanonical = normalizeUrl(pageUrl);
  const { canonicalHrefs, canonicalUrls } = parsedPage;

  if (canonicalHrefs.length === 0) {
    issues.push(
      createIssue(
        "missing-canonical",
        "error",
        "Missing canonical",
        'The page is missing a <link rel="canonical"> tag.',
      ),
    );
    return issues;
  }

  if (canonicalHrefs.length > 1) {
    issues.push(
      createIssue(
        "multiple-canonical",
        "error",
        "Multiple canonicals",
        `The page has ${canonicalHrefs.length} canonical link tags.`,
      ),
    );
  }

  for (const href of canonicalHrefs) {
    if (href.length === 0) {
      issues.push(
        createIssue(
          "empty-canonical",
          "error",
          "Empty canonical",
          "A canonical link tag has an empty href.",
        ),
      );
      continue;
    }

    if (
      !href.startsWith("http://") &&
      !href.startsWith("https://") &&
      !href.startsWith("/")
    ) {
      issues.push(
        createIssue(
          "relative-canonical",
          "warning",
          "Relative canonical",
          `Canonical href is relative: ${href}`,
        ),
      );
    }

    if (href.includes("#")) {
      issues.push(
        createIssue(
          "canonical-hash",
          "warning",
          "Canonical contains hash",
          `Canonical href contains a hash: ${href}`,
        ),
      );
    }
  }

  for (const canonicalUrl of canonicalUrls) {
    let parsedCanonical: URL;

    try {
      parsedCanonical = new URL(canonicalUrl);
    } catch {
      issues.push(
        createIssue(
          "invalid-canonical",
          "error",
          "Invalid canonical",
          `Canonical is not a valid URL: ${canonicalUrl}`,
        ),
      );
      continue;
    }

    if (!isSameOrigin(canonicalUrl, pageUrl)) {
      issues.push(
        createIssue(
          "canonical-different-origin",
          "warning",
          "Canonical different origin",
          `Canonical points to a different origin: ${canonicalUrl}`,
        ),
      );
    }

    const normalizedCanonical = normalizeUrl(canonicalUrl);

    if (normalizedCanonical !== expectedCanonical) {
      issues.push(
        createIssue(
          "canonical-mismatch",
          "warning",
          "Canonical mismatch",
          `Expected canonical ${expectedCanonical} but found ${normalizedCanonical}.`,
        ),
      );
    }

    let parsedExpected: URL;

    try {
      parsedExpected = new URL(expectedCanonical);
    } catch {
      continue;
    }

    const expectedHasQuery = parsedExpected.search.length > 0;
    const canonicalHasUnexpectedQuery =
      parsedCanonical.search.length > 0 && !expectedHasQuery;

    if (canonicalHasUnexpectedQuery) {
      issues.push(
        createIssue(
          "canonical-unexpected-query",
          "warning",
          "Canonical unexpected query params",
          `Canonical contains query params not present on the page URL: ${canonicalUrl}`,
        ),
      );
    }
  }

  for (const href of canonicalHrefs) {
    if (
      href.length > 0 &&
      !href.startsWith("http://") &&
      !href.startsWith("https://")
    ) {
      const alreadyReported = issues.some(
        (issue) => issue.type === "relative-canonical",
      );

      if (!alreadyReported) {
        issues.push(
          createIssue(
            "relative-canonical",
            "warning",
            "Relative canonical",
            `Canonical href is relative: ${href}`,
          ),
        );
      }
    }

    if (
      href.length > 0 &&
      (href.startsWith("http://") || href.startsWith("https://"))
    ) {
      try {
        new URL(href);
      } catch {
        issues.push(
          createIssue(
            "invalid-canonical",
            "error",
            "Invalid canonical",
            `Canonical is not a valid URL: ${href}`,
          ),
        );
      }
    }
  }

  return issues;
};
