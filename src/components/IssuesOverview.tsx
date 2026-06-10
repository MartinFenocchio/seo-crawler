import type { PageAuditResult, SeoIssue } from "@/lib/audit/types";

type IssuesOverviewProps = {
  pages: PageAuditResult[];
  onFilterType?: (issueType: string | null) => void;
  activeIssueType?: string | null;
};

type IssueGroup = {
  type: string;
  title: string;
  count: number;
};

const buildIssueGroups = (pages: PageAuditResult[]): IssueGroup[] => {
  const groups = new Map<string, IssueGroup>();

  for (const page of pages) {
    const seenTypes = new Set<string>();

    for (const issue of page.issues) {
      if (seenTypes.has(issue.type)) {
        continue;
      }

      seenTypes.add(issue.type);
      const existing = groups.get(issue.type);

      if (existing) {
        existing.count += 1;
      } else {
        groups.set(issue.type, {
          type: issue.type,
          title: issue.title,
          count: 1,
        });
      }
    }
  }

  return [...groups.values()].sort((a, b) => b.count - a.count);
};

export const IssuesOverview = ({
  pages,
  onFilterType,
  activeIssueType,
}: IssuesOverviewProps) => {
  const groups = buildIssueGroups(pages);

  if (groups.length === 0) {
    return (
      <div className="rounded-2xl border border-[#54c473]/20 bg-[#54c473]/10 p-6 text-sm text-[#54c473]">
        No issues found across analyzed pages.
      </div>
    );
  }

  return (
    <div className="panel p-6">
      <h2 className="text-lg font-semibold text-white">Issues overview</h2>
      <ul className="mt-4 space-y-2">
        {groups.map((group) => (
          <li key={group.type}>
            <button
              type="button"
              onClick={() =>
                onFilterType?.(
                  activeIssueType === group.type ? null : group.type,
                )
              }
              className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
                activeIssueType === group.type
                  ? "border-[#54c473]/40 bg-[#54c473]/10"
                  : "border-white/8 bg-black/20 hover:border-[#54c473]/25 hover:bg-white/[0.04]"
              }`}
            >
              <span className="font-medium text-white">{group.title}</span>
              <span className="text-zinc-500">
                {": "}
                {group.count} {group.count === 1 ? "page" : "pages"}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const getIssueTypesForPage = (issues: SeoIssue[]): string[] => {
  return [...new Set(issues.map((issue) => issue.type))];
};
