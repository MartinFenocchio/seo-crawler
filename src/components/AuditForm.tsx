"use client";

import { useState } from "react";

type AuditFormProps = {
  isLoading: boolean;
  error: string | null;
  onSubmit: (url: string) => Promise<void>;
};

const isValidUrl = (value: string): boolean => {
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

export const AuditForm = ({ isLoading, error, onSubmit }: AuditFormProps) => {
  const [url, setUrl] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidationError(null);

    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      setValidationError("Please enter a URL to audit.");
      return;
    }

    if (!isValidUrl(trimmedUrl)) {
      setValidationError("Enter a valid http:// or https:// URL.");
      return;
    }

    await onSubmit(trimmedUrl);
  };

  const displayError = validationError ?? error;

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="audit-url"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            Site URL
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <svg
                className="h-4 w-4 text-zinc-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            </div>
            <input
              id="audit-url"
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="http://localhost:3000"
              disabled={isLoading}
              aria-label="URL to audit"
              className="field w-full py-3.5 pl-11 pr-4 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          aria-label="Run SEO audit"
          className="btn-brand w-full sm:w-auto"
        >
          {isLoading ? (
            <>
              <span
                className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#041008]/30 border-t-[#041008]"
                aria-hidden="true"
              />
              Auditing pages…
            </>
          ) : (
            <>
              <svg
                className="h-4 w-4"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
              Run audit
            </>
          )}
        </button>
      </form>

      {displayError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          <svg
            className="mt-0.5 h-4 w-4 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {displayError}
        </div>
      )}
    </div>
  );
};
