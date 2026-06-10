import { normalizeUrl } from "../normalize-url";
import type { CrawledPageContext } from "../types";
import { createIssue } from "./create-issue";
import type { SeoIssue } from "../types";

export const checkInternalLinks = (
  internalLinks: string[],
  crawledPages: Map<string, CrawledPageContext>,
): SeoIssue[] => {
  const issues: SeoIssue[] = [];

  for (const link of internalLinks) {
    const normalizedLink = normalizeUrl(link);
    const target = crawledPages.get(normalizedLink);

    if (!target) {
      continue;
    }

    if (target.statusCode !== null && target.statusCode >= 400) {
      issues.push(
        createIssue(
          "broken-internal-link",
          "warning",
          "Broken internal link",
          `Internal link points to ${normalizedLink} which returned ${target.statusCode}.`,
        ),
      );
      continue;
    }

    if (
      target.finalUrl &&
      normalizeUrl(target.finalUrl) !== normalizedLink
    ) {
      issues.push(
        createIssue(
          "redirected-internal-link",
          "info",
          "Redirected internal link",
          `Internal link points to ${normalizedLink} which redirects to ${normalizeUrl(target.finalUrl)}.`,
        ),
      );
    }
  }

  return issues;
};
