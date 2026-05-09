import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusPill } from "@/components/status-pill";
import { prisma } from "@/lib/prisma";
import { runCompanyResearch } from "./actions";

export const dynamic = "force-dynamic";

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

async function getResearch(caseId: string) {
  return prisma.applicationCase.findUnique({
    where: { id: caseId },
    include: {
      opportunity: true,
      artifacts: {
        where: { type: "company-research" },
        orderBy: { version: "desc" },
        take: 1,
      },
      research: {
        orderBy: { retrievedAt: "desc" },
        take: 40,
      },
    },
  });
}

function groupByCategory<T extends { category: string }>(items: T[]) {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const group = map.get(item.category) ?? [];
    group.push(item);
    map.set(item.category, group);
  }
  return map;
}

export default async function CaseResearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ saved?: string; error?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const applicationCase = await getResearch(id);

  if (!applicationCase) {
    notFound();
  }

  const brief = applicationCase.artifacts[0] ?? null;
  const sources = applicationCase.research;
  const grouped = groupByCategory(sources);

  const message = query?.saved ? "Company research saved." : null;
  const errorMessage =
    query?.error === "research-failed"
      ? "Research failed. Check EXA_API_KEY and try again."
      : query?.error === "exa-missing-key"
        ? "Exa is not configured. Add EXA_API_KEY to personal-recruiter-app/.env and restart the dev server."
      : query?.error
        ? `Error: ${query.error}`
        : null;

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr] lg:items-end">
        <div>
          <StatusPill>Sprint 5</StatusPill>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">
              Company Research
            </h1>
            <Link
              href={`/cases/${applicationCase.id}`}
              className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
            >
              Back to case
            </Link>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Pull source-backed company signals (site, careers, product, recent
            news) and store them with timestamps. This is the substrate for a
            better strategy brief later.
          </p>
          <p className="mt-2 text-xs text-slate-500">
            {applicationCase.opportunity.company} —{" "}
            {applicationCase.opportunity.roleTitle}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-950">Sources saved</p>
          <p className="mt-1 text-3xl font-semibold text-slate-950">
            {sources.length}
          </p>
          <p className="mt-2 text-sm text-slate-600">Latest brief</p>
          <p className="mt-1 text-sm font-medium text-slate-950">
            {brief ? `v${brief.version}` : "None yet"}
          </p>
        </div>
      </section>

      {message ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          {message}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
          {errorMessage}
        </div>
      ) : null}

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">
              Run research
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              This fetches a small set of results per category and persists the
              sources.
            </p>
          </div>
          <form action={runCompanyResearch}>
            <input type="hidden" name="caseId" value={applicationCase.id} />
            <button
              type="submit"
              className="w-fit rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Run company research
            </button>
          </form>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-950">
            Latest saved brief
          </h2>
          {brief ? (
            <pre className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">
              {brief.content}
            </pre>
          ) : (
            <p className="mt-4 text-sm text-slate-600">
              No saved brief yet. Run company research to create one.
            </p>
          )}
        </section>

        <aside className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-950">Sources</h2>
          {sources.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600">
              No sources saved yet.
            </p>
          ) : (
            <div className="mt-4 space-y-6">
              {Array.from(grouped.entries()).map(([category, items]) => (
                <section key={category} className="space-y-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {category} ({items.length})
                  </p>
                  <div className="space-y-3">
                    {items.slice(0, 10).map((source) => (
                      <div
                        key={source.id}
                        className="rounded-md border border-slate-200 p-3"
                      >
                        <p className="text-sm font-medium text-slate-950">
                          {source.title || source.url}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Retrieved {formatDateTime(source.retrievedAt)}
                        </p>
                        {source.snippet ? (
                          <p className="mt-2 text-sm leading-5 text-slate-600">
                            {source.snippet}
                          </p>
                        ) : null}
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex text-sm font-medium text-slate-700 underline underline-offset-4 hover:text-slate-950"
                        >
                          Open
                        </a>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </aside>
      </section>
    </div>
  );
}

