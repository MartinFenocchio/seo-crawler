"use client";

import { useState } from "react";
import type { AuditErrorResponse, AuditResult } from "@/lib/audit/types";
import { AuditForm } from "./AuditForm";
import { AuditResults } from "./AuditResults";

export const AuditApp = () => {
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAudit = async (url: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = (await response.json()) as AuditResult | AuditErrorResponse;

      if (!response.ok) {
        const errorData = data as AuditErrorResponse;
        setError(
          errorData.details
            ? `${errorData.error}: ${errorData.details}`
            : errorData.error,
        );
        return;
      }

      setResult(data as AuditResult);
    } catch {
      setError("Failed to run audit. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <section aria-label="Audit configuration" className="panel p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#54c473]/15">
            <svg
              className="h-5 w-5 text-[#54c473]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Run an audit</h2>
            <p className="text-sm text-zinc-400">
              Enter your local dev URL or sitemap address
            </p>
          </div>
        </div>

        <AuditForm
          isLoading={isLoading}
          error={error}
          onSubmit={handleAudit}
        />
      </section>

      {isLoading && (
        <section
          aria-label="Audit progress"
          className="panel p-10 text-center"
        >
          <div className="relative mx-auto mb-5 h-12 w-12">
            <div className="absolute inset-0 animate-ping rounded-full bg-[#54c473]/20" />
            <div className="relative h-12 w-12 animate-spin rounded-full border-2 border-white/10 border-t-[#54c473]" />
          </div>
          <p className="text-base font-semibold text-white">Auditing pages…</p>
          <p className="mt-2 text-sm text-zinc-400">
            Fetching sitemap, crawling pages, and running SEO checks.
          </p>
        </section>
      )}

      {!isLoading && result && (
        <section aria-label="Audit results">
          <AuditResults result={result} />
        </section>
      )}

      {!isLoading && !result && !error && (
        <section
          aria-label="Audit results placeholder"
          className="panel-muted p-10 text-center"
        >
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#54c473]/10">
            <svg
              className="h-6 w-6 text-[#54c473]/50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="text-sm text-zinc-500">
            Results will appear here after you run an audit.
          </p>
        </section>
      )}
    </div>
  );
};
