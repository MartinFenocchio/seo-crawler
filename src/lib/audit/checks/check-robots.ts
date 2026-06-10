import type { ParsedPage } from "../types";
import { createIssue } from "./create-issue";
import type { SeoIssue } from "../types";

const hasRobotsDirective = (
  robotsMeta: string | null,
  directive: string,
): boolean => {
  if (!robotsMeta) {
    return false;
  }

  return robotsMeta
    .toLowerCase()
    .split(",")
    .map((part) => part.trim())
    .includes(directive);
};

export const checkRobots = (parsedPage: ParsedPage): SeoIssue[] => {
  const issues: SeoIssue[] = [];
  const { robotsMeta } = parsedPage;

  if (hasRobotsDirective(robotsMeta, "noindex")) {
    issues.push(
      createIssue(
        "robots-noindex",
        "warning",
        "Noindex",
        'The page has <meta name="robots" content="noindex">.',
      ),
    );

    issues.push(
      createIssue(
        "sitemap-noindex",
        "warning",
        "In sitemap but noindex",
        "This page is in the sitemap but has a noindex robots directive.",
      ),
    );
  }

  if (hasRobotsDirective(robotsMeta, "nofollow")) {
    issues.push(
      createIssue(
        "robots-nofollow",
        "info",
        "Nofollow",
        'The page has <meta name="robots" content="nofollow">.',
      ),
    );
  }

  return issues;
};
