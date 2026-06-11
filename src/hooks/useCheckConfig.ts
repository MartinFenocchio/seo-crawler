"use client";

import { useState } from "react";
import {
  CHECK_GROUPS,
  type CheckConfig,
  defaultCheckConfig,
} from "@/lib/audit/check-groups";

const STORAGE_KEY = "seo-check-config";

export const useCheckConfig = () => {
  const [config, setConfig] = useState<CheckConfig>(() => {
    if (typeof window === "undefined") return defaultCheckConfig();
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return defaultCheckConfig();
      return { ...defaultCheckConfig(), ...JSON.parse(stored) };
    } catch {
      return defaultCheckConfig();
    }
  });

  const toggle = (groupId: string) => {
    setConfig((prev) => {
      const next = { ...prev, [groupId]: !prev[groupId] };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const reset = () => {
    const defaults = defaultCheckConfig();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
    } catch {}
    setConfig(defaults);
  };

  const activeCount = CHECK_GROUPS.filter((g) => config[g.id] !== false).length;
  const isAllActive = activeCount === CHECK_GROUPS.length;

  return { config, toggle, reset, activeCount, isAllActive };
};
