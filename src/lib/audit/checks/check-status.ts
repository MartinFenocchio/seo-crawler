import { isHtmlContentType } from "../parse-html";
import { normalizeUrl } from "../normalize-url";
import type { FetchResult, SeoIssue } from "../types";
import { createIssue } from "./create-issue";

export const checkStatus = (
  fetchResult: FetchResult,
  pageUrl: string,
): SeoIssue[] => {
  const issues: SeoIssue[] = [];

  if (fetchResult.error) {
    issues.push(
      createIssue(
        "fetch-failed",
        "error",
        "Fetch failed",
        fetchResult.error,
      ),
    );
    return issues;
  }

  const statusCode = fetchResult.statusCode;

  if (statusCode === null) {
    issues.push(
      createIssue(
        "fetch-failed",
        "error",
        "Fetch failed",
        "No HTTP status code was returned.",
      ),
    );
    return issues;
  }

  if (statusCode >= 400) {
    issues.push(
      createIssue(
        "http-error",
        "error",
        "HTTP error",
        `Page returned ${statusCode}.`,
      ),
    );
  } else if (statusCode >= 300) {
    issues.push(
      createIssue(
        "http-redirect",
        "warning",
        "HTTP redirect",
        `Page returned ${statusCode}.`,
      ),
    );
  }

  if (fetchResult.finalUrl) {
    const normalizedOriginal = normalizeUrl(pageUrl);
    const normalizedFinal = normalizeUrl(fetchResult.finalUrl);

    if (normalizedOriginal !== normalizedFinal) {
      issues.push(
        createIssue(
          "url-redirect",
          "info",
          "URL redirect",
          `Page redirected from ${normalizedOriginal} to ${normalizedFinal}.`,
        ),
      );
    }
  }

  return issues;
};

export const checkHtmlContent = (
  fetchResult: FetchResult,
): SeoIssue[] => {
  if (fetchResult.error || !fetchResult.body) {
    return [];
  }

  if (!isHtmlContentType(fetchResult.contentType)) {
    return [
      createIssue(
        "non-html",
        "warning",
        "Non-HTML content",
        "The URL did not return HTML content and could not be analyzed.",
      ),
    ];
  }

  return [];
};
