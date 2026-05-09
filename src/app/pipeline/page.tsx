import Link from "next/link";
import { StatusPill } from "@/components/status-pill";
import { caseStatuses, caseStatusLabel } from "@/lib/case-statuses";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const CLOSED_STATUSES = new Set(["rejected", "withdrawn", "archived"]);

type PipelineSearchParams = {
  status?: string;
  q?: string;
  stale?: string;
  due?: string;
};

function isTruthy(value: string | undefined) {
  return value === "1" || value === "true" || value === "yes" || value === "on";
}

function formatDate(date: Date | null) {
  if (!date) return "Not set";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

async function getPipelineCases(filters: {
  status?: string;
  query?: string;
  staleOnly?: boolean;
  dueOnly?: boolean;
}) {
  const whereStatus = filters.status?.trim();
  const query = filters.query?.trim();
  const staleOnly = Boolean(filters.staleOnly);
  const dueOnly = Boolean(filters.dueOnly);

  const where: Record<string, unknown> = {};

  if (whereStatus) {
    where.status = whereStatus;
  }

  if (query) {
    where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { opportunity: { company: { contains: query, mode: "insensitive" } } },
      { opportunity: { roleTitle: { contains: query, mode: "insensitive" } } },
    ];
  }

  if (staleOnly) {
    where.status = { notIn: Array.from(CLOSED_STATUSES) };
    where.updatedAt = { lt: daysAgo(10) };
  }

  if (dueOnly) {
    where.status = { notIn: Array.from(CLOSED_STATUSES) };
    where.followUpAt = { lte: startOfToday() };
  }

  return prisma.applicationCase.findMany({
    where,
    include: {
      opportunity: true,
      timeline: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: [{ followUpAt: "asc" }, { updatedAt: "desc" }],
  });
}

export default async function PipelinePage({
  searchParams,
}: {
  searchParams?: Promise<PipelineSearchParams>;
}) {
  const params = await searchParams;

  const status = params?.status?.trim() || "";
  const q = params?.q?.trim() || "";
  const stale = isTruthy(params?.stale);
  const due = isTruthy(params?.due);

  const cases = await getPipelineCases({
    status: status || undefined,
    query: q || undefined,
    staleOnly: stale,
    dueOnly: due,
  });

  const byStatus = new Map<string, typeof cases>();
  for (const caseStatus of caseStatuses) {
    byStatus.set(caseStatus, []);
  }
  for (const row of cases) {
    const bucket = byStatus.get(row.status) ?? [];
    bucket.push(row);
    byStatus.set(row.status, bucket);
  }

  const activeCases = cases.filter((row) => !CLOSED_STATUSES.has(row.status));
  const dueCases = activeCases.filter(
    (row) => row.followUpAt && row.followUpAt <= startOfToday(),
  );
  const staleCases = activeCases.filter((row) => row.updatedAt < daysAgo(10));

  const filtersLabel = [
    status ? `Status: ${caseStatusLabel(status)}` : null,
    q ? `Query: ${q}` : null,
    stale ? "Stale only" : null,
    due ? "Follow-up due" : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr] lg:items-end">
        <div>
          <StatusPill>Sprint 7</StatusPill>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            Pipeline
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Track momentum across all cases. Filter by status, search, and
            surface stale or follow-up-due work.
          </p>
          {filtersLabel ? (
            <p className="mt-3 text-xs font-medium uppercase tracking-wide text-slate-500">
              {filtersLabel}
            </p>
          ) : null}
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Metric label="Active" value={activeCases.length} />
          <Metric label="Due" value={dueCases.length} />
          <Metric label="Stale" value={staleCases.length} />
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-950">Filters</h2>
        <form className="mt-4 grid gap-4 md:grid-cols-[1fr_220px_220px_auto] md:items-end">
          <label className="grid gap-2 text-sm">
            <span className="font-medium text-slate-800">Search</span>
            <input
              name="q"
              defaultValue={q}
              placeholder="Company, role, or case title"
              className="rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-500"
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium text-slate-800">Status</span>
            <select
              name="status"
              defaultValue={status}
              className="rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-500"
            >
              <option value="">All statuses</option>
              {caseStatuses.map((statusValue) => (
                <option key={statusValue} value={statusValue}>
                  {caseStatusLabel(statusValue)}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-2 text-sm">
            <span className="font-medium text-slate-800">Quick views</span>
            <div className="flex flex-wrap gap-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="due"
                  defaultChecked={due}
                  value="1"
                />
                <span className="text-slate-700">Follow-up due</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="stale"
                  defaultChecked={stale}
                  value="1"
                />
                <span className="text-slate-700">Stale (10d+)</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="h-10 w-fit rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Apply
          </button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/pipeline"
            className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Clear filters
          </Link>
          <Link
            href="/cases"
            className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Open case list
          </Link>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-lg font-semibold text-slate-950">
            Next actions (due soonest)
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Sorted by follow-up date, then recent updates.
          </p>
        </div>
        {cases.length === 0 ? (
          <div className="p-5 text-sm text-slate-600">
            No cases match the selected filters.
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {cases.slice(0, 12).map((applicationCase) => {
              const isClosed = CLOSED_STATUSES.has(applicationCase.status);
              const isStale =
                !isClosed && applicationCase.updatedAt < daysAgo(10);
              const isDue =
                !isClosed &&
                applicationCase.followUpAt &&
                applicationCase.followUpAt <= startOfToday();

              return (
                <article
                  key={applicationCase.id}
                  className="grid gap-3 p-5 md:grid-cols-[1fr_240px] md:items-start"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusPill>
                        {caseStatusLabel(applicationCase.status)}
                      </StatusPill>
                      {isDue ? (
                        <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-900">
                          Follow-up due
                        </span>
                      ) : null}
                      {isStale ? (
                        <span className="rounded-full bg-rose-100 px-2 py-1 text-xs font-medium text-rose-900">
                          Stale
                        </span>
                      ) : null}
                      <span className="text-xs text-slate-500">
                        Follow-up: {formatDate(applicationCase.followUpAt)}
                      </span>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-slate-950">
                      {applicationCase.opportunity.company} —{" "}
                      {applicationCase.opportunity.roleTitle}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {applicationCase.nextAction || "No next action saved."}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      Last updated: {formatDate(applicationCase.updatedAt)}
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
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-950">
            By status (counts)
          </h2>
          <p className="text-sm text-slate-500">
            Showing counts for current filter set.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {caseStatuses.map((statusValue) => (
            <StatusCard
              key={statusValue}
              status={statusValue}
              count={byStatus.get(statusValue)?.length ?? 0}
              q={q}
              stale={stale}
              due={due}
            />
          ))}
        </div>
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

function StatusCard({
  status,
  count,
  q,
  stale,
  due,
}: {
  status: string;
  count: number;
  q: string;
  stale: boolean;
  due: boolean;
}) {
  const href = new URLSearchParams();
  if (status) href.set("status", status);
  if (q) href.set("q", q);
  if (stale) href.set("stale", "1");
  if (due) href.set("due", "1");

  return (
    <Link
      href={`/pipeline?${href.toString()}`}
      className="rounded-lg border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm"
    >
      <StatusPill>{caseStatusLabel(status)}</StatusPill>
      <p className="mt-3 text-3xl font-semibold text-slate-950">{count}</p>
      <p className="mt-1 text-sm text-slate-600">cases</p>
    </Link>
  );
}

