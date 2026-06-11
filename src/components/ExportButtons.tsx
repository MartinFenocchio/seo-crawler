"use client";

import type { AuditResult } from "@/lib/audit/types";
import type { CheckConfig } from "@/lib/audit/check-groups";
import { filterVisibleIssues } from "@/lib/audit/check-groups";

type ExportButtonsProps = {
  result: AuditResult;
  config: CheckConfig;
};

const triggerDownload = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const escapeCsvCell = (value: string): string => {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

const buildCsv = (result: AuditResult, config: CheckConfig): string => {
  const headers = [
    "URL", "HTTP Status", "Title", "Severity", "Issue Type", "Issue Title", "Issue Message",
  ];
  const rows: string[][] = [headers];

  for (const page of result.pages) {
    const visible = filterVisibleIssues(page.issues, config);

    if (visible.length === 0) {
      rows.push([
        page.url,
        String(page.statusCode ?? ""),
        page.title ?? "",
        "clean", "", "", "",
      ]);
    } else {
      for (const issue of visible) {
        rows.push([
          page.url,
          String(page.statusCode ?? ""),
          page.title ?? "",
          issue.severity,
          issue.type,
          issue.title,
          issue.message,
        ]);
      }
    }
  }

  return rows.map((row) => row.map(escapeCsvCell).join(",")).join("\n");
};

export const ExportButtons = ({ result, config }: ExportButtonsProps) => {
  const slug = new URL(result.baseUrl).hostname.replace(/[^a-z0-9]/gi, "-");
  const date = result.startedAt.slice(0, 10);
  const basename = `seo-audit-${slug}-${date}`;

  const handleJson = () => {
    triggerDownload(
      JSON.stringify(result, null, 2),
      `${basename}.json`,
      "application/json",
    );
  };

  const handleCsv = () => {
    triggerDownload(buildCsv(result, config), `${basename}.csv`, "text/csv");
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-zinc-600">Export:</span>
      <button
        type="button"
        onClick={handleCsv}
        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-zinc-200"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path
            d="M6 1v7M3.5 5.5L6 8l2.5-2.5M2 10h8"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        CSV
      </button>
      <button
        type="button"
        onClick={handleJson}
        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-zinc-200"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path
            d="M6 1v7M3.5 5.5L6 8l2.5-2.5M2 10h8"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        JSON
      </button>
    </div>
  );
};
