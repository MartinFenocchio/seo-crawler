"use client";

import { useState } from "react";
import type { PageAuditResult } from "@/lib/audit/types";
import { buildPagePrompt } from "@/lib/audit/build-prompt";

type Props = {
  page: PageAuditResult;
};

export const CopyPromptButton = ({ page }: Props) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const prompt = buildPagePrompt(page);
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
        copied
          ? "border-[#54c473]/40 bg-[#54c473]/10 text-[#54c473]"
          : "border-white/10 bg-white/[0.04] text-zinc-400 hover:border-white/20 hover:bg-white/[0.07] hover:text-zinc-200"
      }`}
      title="Copy AI prompt with all issue details"
    >
      {copied ? (
        <>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M2 6l3 3 5-5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
          >
            <rect
              x="4"
              y="4"
              width="7"
              height="7"
              rx="1.5"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <path
              d="M8 4V2.5A1.5 1.5 0 0 0 6.5 1h-4A1.5 1.5 0 0 0 1 2.5v4A1.5 1.5 0 0 0 2.5 8H4"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
          Copy AI prompt
        </>
      )}
    </button>
  );
};
