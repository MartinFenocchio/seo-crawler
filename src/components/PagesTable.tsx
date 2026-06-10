"use client";

import { Fragment, useMemo, useState } from "react";
import type { PageAuditResult } from "@/lib/audit/types";
import { getHighestSeverity, SeverityBadge } from "./SeverityBadge";

export type PageFilter = "all" | "errors" | "warnings" | "clean";

type PagesTableProps = {
  pages: PageAuditResult[];
  searchQuery: string;
  filter: PageFilter;
  issueTypeFilter?: string | null;
};

const matchesFilter = (
  page: PageAuditResult,
  filter: PageFilter,
): boolean => {
  const hasError = page.issues.some((issue) => issue.severity === "error");
  const hasWarning = page.issues.some((issue) => issue.severity === "warning");

  switch (filter) {
    case "errors":
      return hasError;
    case "warnings":
      return hasWarning;
    case "clean":
      return !hasError && !hasWarning;
    default:
      return true;
  }
};

const getCanonicalStatus = (page: PageAuditResult): string => {
  if (page.canonicalUrls.length === 0) {
    return "Missing";
  }

  if (page.canonicalUrls.length > 1) {
    return "Multiple";
  }

  const hasMismatch = page.issues.some(
    (issue) => issue.type === "canonical-mismatch",
  );

  return hasMismatch ? "Mismatch" : "OK";
};

export const PagesTable = ({
  pages,
  searchQuery,
  filter,
  issueTypeFilter,
}: PagesTableProps) => {
  const [expandedUrls, setExpandedUrls] = useState<Set<string>>(new Set());

  const filteredPages = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return pages.filter((page) => {
      if (!matchesFilter(page, filter)) {
        return false;
      }

      if (
        issueTypeFilter &&
        !page.issues.some((issue) => issue.type === issueTypeFilter)
      ) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        page.url.toLowerCase().includes(query) ||
        page.normalizedUrl.toLowerCase().includes(query)
      );
    });
  }, [pages, searchQuery, filter, issueTypeFilter]);

  const handleToggleRow = (normalizedUrl: string) => {
    setExpandedUrls((current) => {
      const next = new Set(current);

      if (next.has(normalizedUrl)) {
        next.delete(normalizedUrl);
      } else {
        next.add(normalizedUrl);
      }

      return next;
    });
  };

  if (filteredPages.length === 0) {
    return (
      <div className="panel p-8 text-center text-sm text-zinc-500">
        No pages match the current filters.
      </div>
    );
  }

  return (
    <div className="panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-white/8 bg-black/20">
              <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#54c473]">
                URL
              </th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Status
              </th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Title
              </th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                H1
              </th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Canonical
              </th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Issues
              </th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Severity
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredPages.map((page) => {
              const isExpanded = expandedUrls.has(page.normalizedUrl);
              const highestSeverity = getHighestSeverity(
                page.issues.map((issue) => issue.severity),
              );

              return (
                <Fragment key={page.normalizedUrl}>
                  <tr
                    className="cursor-pointer border-b border-white/5 transition hover:bg-white/[0.03]"
                    onClick={() => handleToggleRow(page.normalizedUrl)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleToggleRow(page.normalizedUrl);
                      }
                    }}
                    tabIndex={0}
                    aria-expanded={isExpanded}
                  >
                    <td className="max-w-xs break-all px-4 py-3.5 font-mono text-xs text-zinc-300">
                      {page.url}
                    </td>
                    <td className="px-4 py-3.5 text-zinc-400">
                      {page.statusCode ?? "—"}
                    </td>
                    <td className="max-w-xs truncate px-4 py-3.5 text-zinc-400">
                      {page.title ?? "—"}
                    </td>
                    <td className="px-4 py-3.5 text-zinc-400">
                      {page.h1s.length}
                    </td>
                    <td className="px-4 py-3.5 text-zinc-400">
                      {getCanonicalStatus(page)}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[#54c473]/15 px-2 text-xs font-bold text-[#54c473]">
                        {page.issues.length}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {highestSeverity ? (
                        <SeverityBadge severity={highestSeverity} />
                      ) : (
                        <span className="text-xs font-medium text-[#54c473]">
                          clean
                        </span>
                      )}
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="border-b border-white/5">
                      <td
                        colSpan={7}
                        className="border-l-2 border-l-[#54c473]/50 bg-black/20 px-4 py-5"
                      >
                        <div className="grid gap-4 lg:grid-cols-2">
                          <div className="space-y-2 text-sm text-zinc-400">
                            <p>
                              <span className="font-semibold text-zinc-200">
                                Title:
                              </span>{" "}
                              {page.title ?? "—"}
                            </p>
                            <p>
                              <span className="font-semibold text-zinc-200">
                                Meta description:
                              </span>{" "}
                              {page.metaDescription ?? "—"}
                            </p>
                            <p>
                              <span className="font-semibold text-zinc-200">
                                H1 values:
                              </span>{" "}
                              {page.h1s.length > 0
                                ? page.h1s.join(" · ")
                                : "—"}
                            </p>
                            <p>
                              <span className="font-semibold text-zinc-200">
                                Canonical:
                              </span>{" "}
                              {page.canonicalUrls.length > 0
                                ? page.canonicalUrls.join(" · ")
                                : "—"}
                            </p>
                            <p>
                              <span className="font-semibold text-zinc-200">
                                Robots meta:
                              </span>{" "}
                              {page.robotsMeta ?? "—"}
                            </p>
                            <p>
                              <span className="font-semibold text-zinc-200">
                                Internal links:
                              </span>{" "}
                              {page.internalLinks.length}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-zinc-200">
                              Issues
                            </p>
                            {page.issues.length === 0 ? (
                              <p className="mt-2 text-sm text-[#54c473]">
                                No issues on this page.
                              </p>
                            ) : (
                              <ul className="mt-2 space-y-2">
                                {page.issues.map((issue) => (
                                  <li
                                    key={issue.id}
                                    className="rounded-xl border border-white/8 bg-white/[0.02] p-3"
                                  >
                                    <div className="flex items-center gap-2">
                                      <SeverityBadge
                                        severity={issue.severity}
                                      />
                                      <span className="text-sm font-medium text-zinc-200">
                                        {issue.title}
                                      </span>
                                    </div>
                                    <p className="mt-1 text-sm text-zinc-500">
                                      {issue.message}
                                    </p>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
