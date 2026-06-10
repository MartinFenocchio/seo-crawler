const SKIPPED_HREF_PREFIXES = ["mailto:", "tel:", "javascript:"] as const;

const collapsePathSlashes = (pathname: string): string => {
  const collapsed = pathname.replace(/\/{2,}/g, "/");
  return collapsed === "" ? "/" : collapsed;
};

const normalizePathname = (pathname: string): string => {
  const collapsed = collapsePathSlashes(pathname);

  if (collapsed === "/") {
    return "/";
  }

  return collapsed.endsWith("/") ? collapsed.slice(0, -1) : collapsed;
};

export const normalizeUrl = (url: string): string => {
  const trimmed = url.trim();

  if (!trimmed) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    parsed.hash = "";
    parsed.pathname = normalizePathname(parsed.pathname || "/");
    return parsed.href;
  } catch {
    return trimmed;
  }
};

export const resolveUrl = (href: string, baseUrl: string): string | null => {
  const trimmed = href.trim();

  if (!trimmed || trimmed === "#" || trimmed.startsWith("#")) {
    return null;
  }

  const lowerHref = trimmed.toLowerCase();
  if (SKIPPED_HREF_PREFIXES.some((prefix) => lowerHref.startsWith(prefix))) {
    return null;
  }

  try {
    const resolved = new URL(trimmed, baseUrl);

    if (resolved.protocol !== "http:" && resolved.protocol !== "https:") {
      return null;
    }

    return normalizeUrl(resolved.href);
  } catch {
    return null;
  }
};

export const isSameOrigin = (urlA: string, urlB: string): boolean => {
  try {
    const parsedA = new URL(urlA);
    const parsedB = new URL(urlB);
    return parsedA.origin === parsedB.origin;
  } catch {
    return false;
  }
};
