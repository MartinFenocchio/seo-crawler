import { REQUEST_TIMEOUT_MS, USER_AGENT } from "./constants";
import type { FetchResult } from "./types";

const getFetchErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    if (error.name === "TimeoutError" || error.name === "AbortError") {
      return `Request timed out after ${REQUEST_TIMEOUT_MS}ms.`;
    }

    return error.message;
  }

  return "Fetch failed.";
};

export const fetchUrl = async (url: string): Promise<FetchResult> => {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      redirect: "follow",
    });

    let body: string | null = null;

    try {
      body = await response.text();
    } catch {
      body = null;
    }

    return {
      url,
      ok: response.ok,
      statusCode: response.status,
      finalUrl: response.url || url,
      contentType: response.headers.get("content-type"),
      body,
      error: null,
    };
  } catch (error) {
    return {
      url,
      ok: false,
      statusCode: null,
      finalUrl: null,
      contentType: null,
      body: null,
      error: getFetchErrorMessage(error),
    };
  }
};

export const fetchXml = async (url: string): Promise<string> => {
  const result = await fetchUrl(url);

  if (result.error) {
    throw new Error(result.error);
  }

  if (result.statusCode === null || result.statusCode >= 400) {
    throw new Error(`Sitemap returned HTTP ${result.statusCode ?? "unknown"}.`);
  }

  if (!result.body) {
    throw new Error("Sitemap response was empty.");
  }

  return result.body;
};
