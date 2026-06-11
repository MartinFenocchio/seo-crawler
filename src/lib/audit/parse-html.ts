import * as cheerio from "cheerio";
import { resolveUrl } from "./normalize-url";
import type { ParsedPage } from "./types";

export const isHtmlContentType = (contentType: string | null): boolean => {
  if (!contentType) {
    return false;
  }

  const normalized = contentType.toLowerCase();
  return (
    normalized.includes("text/html") ||
    normalized.includes("application/xhtml+xml")
  );
};

export const parseHtml = (html: string, pageUrl: string): ParsedPage => {
  const $ = cheerio.load(html);

  const title = $("head title").first().text().trim() || null;

  const metaDescription =
    $("head meta[name='description']").first().attr("content")?.trim() ?? null;

  const h1s = $("h1")
    .map((_, element) => $(element).text().trim())
    .get();

  const canonicalElements = $("link[rel='canonical']");
  const canonicalHrefs = canonicalElements
    .map((_, element) => $(element).attr("href")?.trim() ?? "")
    .get()
    .filter((href) => href.length > 0);

  const canonicalUrls = canonicalHrefs
    .map((href) => resolveUrl(href, pageUrl))
    .filter((url): url is string => url !== null);

  const robotsMeta =
    $("head meta[name='robots']").first().attr("content")?.trim() ?? null;

  const ogTitle =
    $("head meta[property='og:title']").first().attr("content")?.trim() ?? null;

  const ogDescription =
    $("head meta[property='og:description']").first().attr("content")?.trim() ?? null;

  const ogImage =
    $("head meta[property='og:image']").first().attr("content")?.trim() ?? null;

  const twitterCard =
    $("head meta[name='twitter:card']").first().attr("content")?.trim() ?? null;

  const images: { src: string; alt: string | null }[] = [];

  $("img").each((_, element) => {
    const src = $(element).attr("src") ?? "";
    const altAttr = $(element).attr("alt");
    images.push({ src, alt: altAttr !== undefined ? altAttr : null });
  });

  const internalLinks = new Set<string>();

  $("a[href]").each((_, element) => {
    const href = $(element).attr("href");

    if (!href) {
      return;
    }

    const resolved = resolveUrl(href, pageUrl);

    if (resolved) {
      internalLinks.add(resolved);
    }
  });

  return {
    title,
    metaDescription,
    h1s,
    canonicalHrefs,
    canonicalUrls,
    robotsMeta,
    internalLinks: [...internalLinks],
    ogTitle,
    ogDescription,
    ogImage,
    twitterCard,
    images,
  };
};
