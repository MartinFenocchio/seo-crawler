"use client";

import { Fragment, useMemo, useState } from "react";
import type { CheckConfig } from "@/lib/audit/check-groups";
import { filterVisibleIssues } from "@/lib/audit/check-groups";
import type { PageAuditResult, SeoIssue } from "@/lib/audit/types";
import { getHighestSeverity, SeverityBadge } from "./SeverityBadge";
import { CopyPromptButton } from "./CopyPromptButton";

export type PageFilter = "all" | "errors" | "warnings" | "clean";

type PagesTableProps = {
  pages: PageAuditResult[];
  searchQuery: string;
  filter: PageFilter;
  config: CheckConfig;
  issueTypeFilter?: string | null;
};

const matchesFilter = (
  visibleIssues: SeoIssue[],
  filter: PageFilter,
): boolean => {
  const hasError = visibleIssues.some((issue) => issue.severity === "error");
  const hasWarning = visibleIssues.some((issue) => issue.severity === "warning");

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

type CanonicalStatus = "Missing" | "Multiple" | "Mismatch" | "OK";

const getCanonicalStatus = (page: PageAuditResult): CanonicalStatus => {
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

const canonicalStatusClass: Record<CanonicalStatus, string> = {
  Missing: "text-red-400 font-semibold",
  Multiple: "text-red-400 font-semibold",
  Mismatch: "text-yellow-400 font-semibold",
  OK: "text-zinc-400",
};

export const PagesTable = ({
  pages,
  searchQuery,
  filter,
  config,
  issueTypeFilter,
}: PagesTableProps) => {
  const [expandedUrls, setExpandedUrls] = useState<Set<string>>(new Set());

  const filteredPages = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return pages.filter((page) => {
      const visibleIssues = filterVisibleIssues(page.issues, config);

      if (!matchesFilter(visibleIssues, filter)) {
        return false;
      }

      if (
        issueTypeFilter &&
        !visibleIssues.some((issue) => issue.type === issueTypeFilter)
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
  }, [pages, searchQuery, filter, config, issueTypeFilter]);

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
              const visibleIssues = filterVisibleIssues(page.issues, config);
              const highestSeverity = getHighestSeverity(
                visibleIssues.map((issue) => issue.severity),
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
                    <td className="max-w-xs break-all px-4 py-3.5 font-mono text-xs">
                      <span
                        className={`cursor-copy select-all ${page.statusCode !== null && page.statusCode >= 400 ? "text-red-400" : "text-zinc-300"}`}
                        title="Click to copy URL"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(page.url);
                        }}
                      >
                        {page.url}
                      </span>
                    </td>
                    <td className="max-w-xs truncate px-4 py-3.5 text-zinc-400">
                      {page.title ?? "—"}
                    </td>
                    <td className={`px-4 py-3.5 ${page.h1s.length === 1 ? "text-zinc-400" : "font-semibold text-red-400"}`}>
                      {page.h1s.length}
                    </td>
                    <td className={`px-4 py-3.5 ${canonicalStatusClass[getCanonicalStatus(page)]}`}>
                      {getCanonicalStatus(page)}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[#54c473]/15 px-2 text-xs font-bold text-[#54c473]">
                        {visibleIssues.length}
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
                        colSpan={6}
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
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-semibold text-zinc-200">
                                Issues
                              </p>
                              {visibleIssues.length > 0 && (
                                <CopyPromptButton page={page} />
                              )}
                            </div>
                            {visibleIssues.length === 0 ? (
                              <p className="mt-2 text-sm text-[#54c473]">
                                No issues on this page.
                              </p>
                            ) : (
                              <ul className="mt-2 space-y-2">
                                {visibleIssues.map((issue) => (
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
