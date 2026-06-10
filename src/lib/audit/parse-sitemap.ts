import { XMLParser, XMLValidator } from "fast-xml-parser";
import { normalizeUrl } from "./normalize-url";

const xmlParser = new XMLParser({
  ignoreAttributes: true,
  trimValues: true,
  removeNSPrefix: true,
});

export class SitemapParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SitemapParseError";
  }
}

export type SitemapParseResult =
  | { kind: "urlset"; urls: string[] }
  | { kind: "index"; sitemapUrls: string[] };

export type CollectSitemapUrlsResult = {
  urls: string[];
  warnings: string[];
};

const toArray = <T>(value: T | T[] | undefined): T[] => {
  if (value === undefined) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
};

const extractLocs = (entries: unknown): string[] => {
  return toArray(entries as { loc?: string }[])
    .map((entry) => entry?.loc)
    .filter((loc): loc is string => typeof loc === "string" && loc.trim() !== "")
    .map((loc) => normalizeUrl(loc.trim()));
};

export const isDirectSitemapUrl = (url: string): boolean => {
  try {
    const { pathname } = new URL(url.trim());
    const filename = pathname.split("/").pop()?.toLowerCase() ?? "";
    return filename.endsWith(".xml") && filename.includes("sitemap");
  } catch {
    return false;
  }
};

export const getBaseUrlFromInput = (inputUrl: string): string => {
  const trimmed = inputUrl.trim();

  if (isDirectSitemapUrl(trimmed)) {
    try {
      const base = new URL(trimmed);
      base.pathname = "/";
      base.search = "";
      base.hash = "";
      return normalizeUrl(base.href);
    } catch {
      return trimmed;
    }
  }

  return normalizeUrl(trimmed);
};

export const getSitemapUrlFromInput = (inputUrl: string): string => {
  const trimmed = inputUrl.trim();

  if (isDirectSitemapUrl(trimmed)) {
    return normalizeUrl(trimmed);
  }

  try {
    const base = new URL(trimmed);
    base.pathname = "/sitemap.xml";
    base.search = "";
    base.hash = "";
    return normalizeUrl(base.href);
  } catch {
    return trimmed;
  }
};

export const dedupeNormalizedUrls = (urls: string[]): string[] => {
  return [...new Set(urls.map((url) => normalizeUrl(url)))];
};

const parseSitemapDocument = (xml: string): SitemapParseResult => {
  const validation = XMLValidator.validate(xml);

  if (validation !== true) {
    throw new SitemapParseError("Sitemap XML is invalid.");
  }

  let parsed: Record<string, unknown>;

  try {
    parsed = xmlParser.parse(xml) as Record<string, unknown>;
  } catch {
    throw new SitemapParseError("Sitemap XML could not be parsed.");
  }

  if (parsed.urlset) {
    const urlset = parsed.urlset as { url?: unknown };
    const urls = extractLocs(urlset.url);

    return { kind: "urlset", urls };
  }

  if (parsed.sitemapindex) {
    const sitemapIndex = parsed.sitemapindex as { sitemap?: unknown };
    const sitemapUrls = extractLocs(sitemapIndex.sitemap);

    return { kind: "index", sitemapUrls };
  }

  throw new SitemapParseError("Sitemap XML does not contain a urlset or sitemapindex.");
};

export const parseSitemap = (xml: string): string[] => {
  const result = parseSitemapDocument(xml);

  if (result.kind === "index") {
    throw new SitemapParseError(
      "Expected a sitemap urlset but found a sitemap index.",
    );
  }

  return dedupeNormalizedUrls(result.urls);
};

export const parseSitemapIndex = (xml: string): string[] => {
  const result = parseSitemapDocument(xml);

  if (result.kind === "urlset") {
    throw new SitemapParseError(
      "Expected a sitemap index but found a urlset.",
    );
  }

  return dedupeNormalizedUrls(result.sitemapUrls);
};

export const collectSitemapUrls = async (
  xml: string,
  fetchXml: (url: string) => Promise<string>,
): Promise<CollectSitemapUrlsResult> => {
  const result = parseSitemapDocument(xml);

  if (result.kind === "urlset") {
    return {
      urls: dedupeNormalizedUrls(result.urls),
      warnings: [],
    };
  }

  const allUrls: string[] = [];
  const warnings: string[] = [];

  for (const sitemapUrl of result.sitemapUrls) {
    try {
      const nestedXml = await fetchXml(sitemapUrl);
      const nested = await collectSitemapUrls(nestedXml, fetchXml);
      allUrls.push(...nested.urls);
      warnings.push(...nested.warnings);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown fetch error";
      warnings.push(`Failed to fetch nested sitemap ${sitemapUrl}: ${message}`);
    }
  }

  return {
    urls: dedupeNormalizedUrls(allUrls),
    warnings,
  };
};
