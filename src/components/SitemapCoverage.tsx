import type { SitemapCoverageResult } from "@/lib/audit/types";

type SitemapCoverageProps = {
  coverage: SitemapCoverageResult;
};

const UrlList = ({
  title,
  urls,
  emptyMessage,
}: {
  title: string;
  urls: string[];
  emptyMessage: string;
}) => {
  return (
    <div>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      {urls.length === 0 ? (
        <p className="mt-2 text-sm text-zinc-500">{emptyMessage}</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {urls.map((url) => (
            <li
              key={url}
              className="break-all rounded-lg border border-white/8 bg-black/20 px-3 py-2 font-mono text-xs text-zinc-400"
            >
              {url}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export const SitemapCoverage = ({ coverage }: SitemapCoverageProps) => {
  const hasIssues =
    coverage.internalUrlsMissingFromSitemap.length > 0 ||
    coverage.sitemapUrlsNotDiscoveredInternally.length > 0;

  if (!hasIssues) {
    return (
      <div className="rounded-2xl border border-[#54c473]/20 bg-[#54c473]/10 p-6">
        <h2 className="text-lg font-semibold text-[#54c473]">
          Sitemap coverage
        </h2>
        <p className="mt-2 text-sm text-[#54c473]/80">
          All discovered internal links match the sitemap. No coverage gaps
          found.
        </p>
      </div>
    );
  }

  return (
    <div className="panel p-6">
      <h2 className="text-lg font-semibold text-white">Sitemap coverage</h2>
      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <UrlList
          title="Internal URLs missing from sitemap"
          urls={coverage.internalUrlsMissingFromSitemap}
          emptyMessage="No internal URLs missing from the sitemap."
        />
        <UrlList
          title="Sitemap URLs not found in internal links"
          urls={coverage.sitemapUrlsNotDiscoveredInternally}
          emptyMessage="All sitemap URLs were discovered via internal links."
        />
      </div>
    </div>
  );
};
