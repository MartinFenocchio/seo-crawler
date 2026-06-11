import pLimit from "p-limit";
import { CONCURRENCY_LIMIT } from "./constants";
import { fetchUrl, fetchXml } from "./fetch-url";
import { normalizeUrl } from "./normalize-url";
import { isHtmlContentType, parseHtml } from "./parse-html";
import {
  collectSitemapUrls,
  getBaseUrlFromInput,
  getSitemapUrlFromInput,
  SitemapParseError,
} from "./parse-sitemap";
import { checkCanonical } from "./checks/check-canonical";
import { checkH1 } from "./checks/check-h1";
import { checkHtmlContent, checkStatus } from "./checks/check-status";
import { checkImages } from "./checks/check-images";
import { checkInternalLinks } from "./checks/check-internal-links";
import { checkMetaDescription } from "./checks/check-meta-description";
import { checkOg } from "./checks/check-og";
import { checkRobots } from "./checks/check-robots";
import { checkTitle } from "./checks/check-title";
import { createIssue } from "./checks/create-issue";
import { buildSitemapCoverage } from "./sitemap-coverage";
import { buildSummary } from "./summarize";
import type {
  AuditResult,
  CrawledPageContext,
  PageAuditResult,
  SeoIssue,
} from "./types";

export const auditSite = async (inputUrl: string): Promise<AuditResult> => {
  const startedAt = new Date();
  const baseUrl = getBaseUrlFromInput(inputUrl);
  const sitemapUrl = getSitemapUrlFromInput(inputUrl);
  const auditWarnings: SeoIssue[] = [];

  // Global robots.txt check
  const robotsTxtUrl = `${baseUrl.replace(/\/$/, "")}/robots.txt`;
  try {
    const robotsTxtResult = await fetchUrl(robotsTxtUrl);
    if (!robotsTxtResult.ok || robotsTxtResult.statusCode === 404) {
      auditWarnings.push(
        createIssue(
          "robots-txt-missing",
          "info",
          "robots.txt not found",
          `No robots.txt was found at ${robotsTxtUrl}.`,
        ),
      );
    } else if (robotsTxtResult.body) {
      const lines = robotsTxtResult.body.split("\n").map((l) => l.trim());
      let inWildcardAgent = false;
      for (const line of lines) {
        const lower = line.toLowerCase();
        if (lower.startsWith("user-agent:")) {
          inWildcardAgent = lower.replace("user-agent:", "").trim() === "*";
        }
        if (inWildcardAgent && lower.replace("disallow:", "").trim() === "/") {
          auditWarnings.push(
            createIssue(
              "robots-txt-disallow-all",
              "warning",
              "robots.txt blocks all crawlers",
              `robots.txt contains "Disallow: /" under "User-agent: *", blocking all search engines.`,
            ),
          );
          break;
        }
      }
    }
  } catch {
    // Non-critical — ignore robots.txt fetch errors
  }

  let sitemapXml: string;

  try {
    sitemapXml = await fetchXml(sitemapUrl);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not fetch sitemap.";
    throw new Error(`Could not fetch sitemap: ${message}`);
  }

  let sitemapPageUrls: string[];

  try {
    const collected = await collectSitemapUrls(sitemapXml, fetchXml);

    sitemapPageUrls = collected.urls;
    auditWarnings.push(
      ...collected.warnings.map((warning) =>
        createIssue(
          "sitemap-warning",
          "warning",
          "Sitemap warning",
          warning,
        ),
      ),
    );
  } catch (error) {
    const message =
      error instanceof SitemapParseError
        ? error.message
        : error instanceof Error
          ? error.message
          : "Invalid sitemap.";

    throw new Error(message);
  }

  if (sitemapPageUrls.length === 0) {
    throw new Error("Sitemap contains no URLs.");
  }

  const limit = pLimit(CONCURRENCY_LIMIT);
  const fetchResults = await Promise.all(
    sitemapPageUrls.map((pageUrl) =>
      limit(async () => ({
        pageUrl,
        fetchResult: await fetchUrl(pageUrl),
      })),
    ),
  );

  const pages: PageAuditResult[] = [];
  const crawledPages = new Map<string, CrawledPageContext>();

  for (const { pageUrl, fetchResult } of fetchResults) {
    const normalizedUrl = normalizeUrl(pageUrl);
    const issues: SeoIssue[] = [
      ...checkStatus(fetchResult, pageUrl),
      ...checkHtmlContent(fetchResult),
    ];

    let parsedPage = {
      title: null as string | null,
      metaDescription: null as string | null,
      h1s: [] as string[],
      canonicalUrls: [] as string[],
      robotsMeta: null as string | null,
      internalLinks: [] as string[],
    };

    const responseBody = fetchResult.body;
    const canParseHtml =
      !fetchResult.error &&
      responseBody !== null &&
      isHtmlContentType(fetchResult.contentType);

    if (canParseHtml && responseBody !== null) {
      const parsed = parseHtml(responseBody, pageUrl);
      parsedPage = {
        title: parsed.title,
        metaDescription: parsed.metaDescription,
        h1s: parsed.h1s,
        canonicalUrls: parsed.canonicalUrls,
        robotsMeta: parsed.robotsMeta,
        internalLinks: parsed.internalLinks,
      };

      issues.push(
        ...checkTitle(parsed),
        ...checkMetaDescription(parsed),
        ...checkH1(parsed),
        ...checkCanonical(parsed, pageUrl),
        ...checkRobots(parsed),
        ...checkOg(parsed),
        ...checkImages(parsed),
      );
    }

    crawledPages.set(normalizedUrl, {
      normalizedUrl,
      statusCode: fetchResult.statusCode,
      finalUrl: fetchResult.finalUrl,
    });

    pages.push({
      url: pageUrl,
      normalizedUrl,
      statusCode: fetchResult.statusCode,
      finalUrl: fetchResult.finalUrl,
      title: parsedPage.title,
      metaDescription: parsedPage.metaDescription,
      h1s: parsedPage.h1s,
      canonicalUrls: parsedPage.canonicalUrls,
      robotsMeta: parsedPage.robotsMeta,
      internalLinks: parsedPage.internalLinks,
      issues,
    });
  }

  for (const page of pages) {
    page.issues.push(...checkInternalLinks(page.internalLinks, crawledPages));
  }

  const finishedAt = new Date();
  const sitemapCoverage = buildSitemapCoverage(pages, sitemapPageUrls);

  return {
    inputUrl: inputUrl.trim(),
    baseUrl,
    sitemapUrl,
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    durationMs: finishedAt.getTime() - startedAt.getTime(),
    summary: buildSummary(pages),
    pages,
    sitemapCoverage,
    auditWarnings,
  };
};
