import type { AuditSummary } from "@/lib/audit/types";

type SummaryCardsProps = {
  summary: AuditSummary;
  durationMs: number;
};

type SummaryCardProps = {
  label: string;
  value: string | number;
  tone?: "default" | "brand" | "error" | "warning";
};

const SummaryCard = ({ label, value, tone = "default" }: SummaryCardProps) => {
  const styles = {
    default: "border-white/8 bg-white/[0.03] text-white",
    brand: "border-[#54c473]/25 bg-[#54c473]/10 text-[#54c473]",
    error: "border-red-500/20 bg-red-500/10 text-red-300",
    warning: "border-amber-500/20 bg-amber-500/10 text-amber-300",
  };

  const labelColor = {
    default: "text-zinc-500",
    brand: "text-[#54c473]/70",
    error: "text-red-400/70",
    warning: "text-amber-400/70",
  };

  return (
    <div className={`rounded-2xl border p-5 ${styles[tone]}`}>
      <p className={`text-xs font-semibold uppercase tracking-wider ${labelColor[tone]}`}>
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
    </div>
  );
};

export const SummaryCards = ({ summary, durationMs }: SummaryCardsProps) => {
  const durationSeconds = (durationMs / 1000).toFixed(1);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SummaryCard
          label="Total pages"
          value={summary.totalPages}
          tone="brand"
        />
        <SummaryCard
          label="Pages with errors"
          value={summary.pagesWithErrors}
          tone={summary.pagesWithErrors > 0 ? "error" : "default"}
        />
        <SummaryCard
          label="Pages with warnings"
          value={summary.pagesWithWarnings}
          tone={summary.pagesWithWarnings > 0 ? "warning" : "default"}
        />
        <SummaryCard
          label="Total errors"
          value={summary.totalErrors}
          tone={summary.totalErrors > 0 ? "error" : "default"}
        />
        <SummaryCard
          label="Total warnings"
          value={summary.totalWarnings}
          tone={summary.totalWarnings > 0 ? "warning" : "default"}
        />
        <SummaryCard label="Audit duration" value={`${durationSeconds}s`} />
      </div>

      <div className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3 text-sm text-zinc-400">
        <span className="font-semibold text-[#54c473]">
          {summary.totalPages}
        </span>{" "}
        pages analyzed ·{" "}
        <span className="font-semibold text-red-300">
          {summary.pagesWithErrors}
        </span>{" "}
        with errors ·{" "}
        <span className="font-semibold text-amber-300">
          {summary.totalWarnings}
        </span>{" "}
        warnings ·{" "}
        <span className="font-semibold text-white">{durationSeconds}s</span>
      </div>
    </div>
  );
};
