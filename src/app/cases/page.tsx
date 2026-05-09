import Link from "next/link";
import { StatusPill } from "@/components/status-pill";
import { caseStatusLabel } from "@/lib/case-statuses";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getCases() {
  return prisma.applicationCase.findMany({
    include: {
      candidate: true,
      opportunity: true,
      timeline: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

function formatDate(date: Date | null) {
  if (!date) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default async function CasesPage({
  searchParams,
}: {
  searchParams?: Promise<{
    error?: string;
  }>;
}) {
  const params = await searchParams;
  const cases = await getCases();
  const activeCases = cases.filter(
    (applicationCase) =>
      !["rejected", "withdrawn", "archived"].includes(applicationCase.status),
  );

  const message =
    params?.error === "missing-case"
      ? "Case and status are required before saving."
      : null;

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
        <div>
          <StatusPill>Sprint 3</StatusPill>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            Application Cases
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Selected opportunities become case workspaces for strategy, notes,
            status, next actions, and follow-up tracking.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Metric label="Total cases" value={cases.length} />
          <Metric label="Active" value={activeCases.length} />
        </div>
      </section>

      {message ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
          {message}
        </div>
      ) : null}

      <section className="rounded-lg border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">
              Case pipeline
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Convert jobs from Opportunities when you are ready to work them.
            </p>
          </div>
          <Link
            href="/opportunities"
            className="w-fit rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            View opportunities
          </Link>
        </div>

        {cases.length === 0 ? (
          <div className="p-5 text-sm text-slate-600">
            No cases yet. Create one from a saved opportunity.
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {cases.map((applicationCase) => (
              <article
                key={applicationCase.id}
                className="grid gap-4 p-5 lg:grid-cols-[1fr_280px] lg:items-start"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill>
                      {caseStatusLabel(applicationCase.status)}
                    </StatusPill>
                    <span className="text-xs text-slate-500">
                      Follow-up: {formatDate(applicationCase.followUpAt)}
                    </span>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-slate-950">
                    {applicationCase.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {applicationCase.opportunity.company} -{" "}
                    {applicationCase.opportunity.roleTitle}
                    {applicationCase.opportunity.location
                      ? ` - ${applicationCase.opportunity.location}`
                      : ""}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {applicationCase.nextAction ||
                      "No next action saved for this case."}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Latest timeline
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-950">
                    {applicationCase.timeline[0]?.title || "No events yet"}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-600">
                    {applicationCase.timeline[0]?.description ||
                      "Open the case to add updates."}
                  </p>
                  <Link
                    href={`/cases/${applicationCase.id}`}
                    className="mt-4 inline-flex rounded-md bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                  >
                    Open workspace
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <p className="text-sm font-medium text-slate-950">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}
