import { AuditApp } from "@/components/AuditApp";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070b10]">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
      >
        <div className="absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-[#54c473]/15 blur-[100px]" />
        <div className="absolute -right-20 top-1/3 h-80 w-80 rounded-full bg-[#54c473]/8 blur-[80px]" />
      </div>

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <header className="mb-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#54c473]/25 bg-[#54c473]/10 px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-[#54c473]" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#54c473]">
              Technical SEO
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Local SEO Auditor
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-zinc-400">
            Crawl your sitemap and run deterministic technical SEO checks on
            every page. Built for local Next.js development sites.
          </p>
        </header>

        <AuditApp />
      </main>
    </div>
  );
}
