export type SeoSeverity = "error" | "warning" | "info";

export type SeoIssue = {
  id: string;
  type: string;
  severity: SeoSeverity;
  title: string;
  message: string;
};

export type PageAuditResult = {
  url: string;
  normalizedUrl: string;
  statusCode: number | null;
  finalUrl: string | null;
  title: string | null;
  metaDescription: string | null;
  h1s: string[];
  canonicalUrls: string[];
  robotsMeta: string | null;
  internalLinks: string[];
  issues: SeoIssue[];
};

export type AuditSummary = {
  totalPages: number;
  pagesWithErrors: number;
  pagesWithWarnings: number;
  totalErrors: number;
  totalWarnings: number;
  totalInfo: number;
};

export type SitemapCoverageResult = {
  sitemapUrls: string[];
  discoveredInternalUrls: string[];
  internalUrlsMissingFromSitemap: string[];
  sitemapUrlsNotDiscoveredInternally: string[];
};

export type AuditResult = {
  inputUrl: string;
  baseUrl: string;
  sitemapUrl: string | null;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  summary: AuditSummary;
  pages: PageAuditResult[];
  sitemapCoverage: SitemapCoverageResult;
  auditWarnings: SeoIssue[];
};

export type AuditRequest = {
  url: string;
};

export type AuditErrorResponse = {
  error: string;
  details?: string;
};

export type FetchResult = {
  url: string;
  ok: boolean;
  statusCode: number | null;
  finalUrl: string | null;
  contentType: string | null;
  body: string | null;
  error: string | null;
};

export type ParsedPage = {
  title: string | null;
  metaDescription: string | null;
  h1s: string[];
  canonicalHrefs: string[];
  canonicalUrls: string[];
  robotsMeta: string | null;
  internalLinks: string[];
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  twitterCard: string | null;
  images: { src: string; alt: string | null }[];
};

export type CrawledPageContext = {
  normalizedUrl: string;
  statusCode: number | null;
  finalUrl: string | null;
};
