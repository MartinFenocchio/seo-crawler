"use client";

import { useState } from "react";
import { CHECK_GROUPS, type CheckConfig as CheckConfigType } from "@/lib/audit/check-groups";

type CheckConfigProps = {
  config: CheckConfigType;
  activeCount: number;
  isAllActive: boolean;
  onToggle: (groupId: string) => void;
  onReset: () => void;
};

export const CheckConfig = ({
  config,
  activeCount,
  isAllActive,
  onToggle,
  onReset,
}: CheckConfigProps) => {
  const [open, setOpen] = useState(false);
  const total = CHECK_GROUPS.length;

  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.02]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-3.5 text-sm"
      >
        <div className="flex items-center gap-2.5 text-zinc-400">
          <svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M1.5 3h12M3.5 7.5h8M5.5 12h4"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
          <span className="font-medium text-zinc-300">Configure checks</span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`text-xs font-medium ${isAllActive ? "text-zinc-500" : "text-amber-400"}`}
          >
            {activeCount}/{total} active
          </span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
            className={`text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`}
          >
            <path
              d="M3 5l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </button>

      {open && (
        <div className="border-t border-white/8 px-5 pb-5 pt-4">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {CHECK_GROUPS.map((group) => {
              const enabled = config[group.id] !== false;
              return (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => onToggle(group.id)}
                  className={`flex items-start gap-3 rounded-xl border p-3 text-left transition ${
                    enabled
                      ? "border-[#54c473]/25 bg-[#54c473]/8 hover:bg-[#54c473]/12"
                      : "border-white/8 bg-black/20 opacity-60 hover:opacity-80"
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition ${
                      enabled
                        ? "border-[#54c473] bg-[#54c473]"
                        : "border-zinc-600 bg-transparent"
                    }`}
                  >
                    {enabled && (
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M2 5l2.5 2.5L8 3"
                          stroke="#000"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p
                      className={`text-xs font-semibold ${enabled ? "text-zinc-200" : "text-zinc-500"}`}
                    >
                      {group.label}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-600">
                      {group.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {!isAllActive && (
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={onReset}
                className="text-xs text-zinc-500 underline underline-offset-2 hover:text-zinc-300"
              >
                Reset to defaults
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
