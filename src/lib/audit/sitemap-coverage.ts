import { normalizeUrl } from "./normalize-url";
import type { PageAuditResult, SitemapCoverageResult } from "./types";

export const buildSitemapCoverage = (
  pages: PageAuditResult[],
  sitemapUrls: string[],
): SitemapCoverageResult => {
  const normalizedSitemapUrls = dedupeSorted(sitemapUrls.map(normalizeUrl));
  const sitemapSet = new Set(normalizedSitemapUrls);

  const discoveredSet = new Set<string>();

  for (const page of pages) {
    for (const link of page.internalLinks) {
      discoveredSet.add(normalizeUrl(link));
    }
  }

  const discoveredInternalUrls = dedupeSorted([...discoveredSet]);

  const internalUrlsMissingFromSitemap = discoveredInternalUrls.filter(
    (url) => !sitemapSet.has(url),
  );

  const sitemapUrlsNotDiscoveredInternally = normalizedSitemapUrls.filter(
    (url) => !discoveredSet.has(url),
  );

  return {
    sitemapUrls: normalizedSitemapUrls,
    discoveredInternalUrls,
    internalUrlsMissingFromSitemap,
    sitemapUrlsNotDiscoveredInternally,
  };
};

const dedupeSorted = (urls: string[]): string[] => {
  return [...new Set(urls)].sort();
};
