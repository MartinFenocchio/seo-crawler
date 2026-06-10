import type { SeoSeverity } from "@/lib/audit/types";

type SeverityBadgeProps = {
  severity: SeoSeverity;
  label?: string;
};

const severityStyles: Record<SeoSeverity, string> = {
  error: "border-red-500/40 bg-red-500/15 text-red-300",
  warning: "border-amber-500/40 bg-amber-500/15 text-amber-300",
  info: "border-sky-500/40 bg-sky-500/15 text-sky-300",
};

export const SeverityBadge = ({ severity, label }: SeverityBadgeProps) => {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${severityStyles[severity]}`}
    >
      {label ?? severity}
    </span>
  );
};

export const getHighestSeverity = (
  severities: SeoSeverity[],
): SeoSeverity | null => {
  if (severities.includes("error")) {
    return "error";
  }

  if (severities.includes("warning")) {
    return "warning";
  }

  if (severities.includes("info")) {
    return "info";
  }

  return null;
};
