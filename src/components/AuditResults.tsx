"use client";

import { useMemo, useState } from "react";
import { computeSummary, filterVisibleIssues } from "@/lib/audit/check-groups";
import type { AuditResult } from "@/lib/audit/types";
import { useCheckConfig } from "@/hooks/useCheckConfig";
import { CheckConfig } from "./CheckConfig";
import { ExportButtons } from "./ExportButtons";
import { IssuesOverview } from "./IssuesOverview";
import { PagesTable, type PageFilter } from "./PagesTable";
import { SeverityBadge } from "./SeverityBadge";
import { SitemapCoverage } from "./SitemapCoverage";
import { SummaryCards } from "./SummaryCards";

type AuditResultsProps = {
  result: AuditResult;
};

const filterOptions: { value: PageFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "errors", label: "Errors" },
  { value: "warnings", label: "Warnings" },
  { value: "clean", label: "No issues" },
];

export const AuditResults = ({ result }: AuditResultsProps) => {
  const [filter, setFilter] = useState<PageFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [issueTypeFilter, setIssueTypeFilter] = useState<string | null>(null);
  const { config, toggle, reset, activeCount, isAllActive } = useCheckConfig();

  const summary = useMemo(
    () => computeSummary(result.pages, config),
    [result.pages, config],
  );

  const visibleAuditWarnings = useMemo(
    () => filterVisibleIssues(result.auditWarnings, config),
    [result.auditWarnings, config],
  );

  return (
    <div className="space-y-6">
      <SummaryCards summary={summary} durationMs={result.durationMs} />

      <CheckConfig
        config={config}
        activeCount={activeCount}
        isAllActive={isAllActive}
        onToggle={toggle}
        onReset={reset}
      />

      {visibleAuditWarnings.length > 0 && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
          <h2 className="text-sm font-semibold text-amber-300">
            Audit warnings
          </h2>
          <ul className="mt-2 space-y-2">
            {visibleAuditWarnings.map((warning) => (
              <li
                key={warning.id}
                className="flex items-start gap-2 text-sm text-amber-200"
              >
                <SeverityBadge severity={warning.severity} />
                <span>{warning.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <IssuesOverview
        pages={result.pages}
        config={config}
        activeIssueType={issueTypeFilter}
        onFilterType={setIssueTypeFilter}
      />

      <div className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Page results</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Click a row to expand page details and issues.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <ExportButtons result={result} config={config} />

            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by URL"
              aria-label="Search pages by URL"
              className="field w-full px-3 py-2.5 text-sm sm:w-64"
            />

            <div className="flex flex-wrap gap-2">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFilter(option.value)}
                  className={
                    filter === option.value
                      ? "filter-btn filter-btn-active"
                      : "filter-btn"
                  }
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <PagesTable
          pages={result.pages}
          searchQuery={searchQuery}
          filter={filter}
          config={config}
          issueTypeFilter={issueTypeFilter}
        />
      </div>

      <SitemapCoverage coverage={result.sitemapCoverage} />
    </div>
  );
};
