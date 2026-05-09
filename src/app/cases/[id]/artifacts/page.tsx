import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusPill } from "@/components/status-pill";
import { prisma } from "@/lib/prisma";
import { createArtifact, updateArtifact } from "./actions";

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

async function getCaseArtifacts(caseId: string) {
  return prisma.applicationCase.findUnique({
    where: { id: caseId },
    include: {
      opportunity: true,
      artifacts: { orderBy: [{ type: "asc" }, { version: "desc" }] },
    },
  });
}

function groupByType<T extends { type: string }>(items: T[]) {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const group = map.get(item.type) ?? [];
    group.push(item);
    map.set(item.type, group);
  }
  return map;
}

export default async function CaseArtifactsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ saved?: string; created?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const applicationCase = await getCaseArtifacts(id);

  if (!applicationCase) {
    notFound();
  }

  const message = query?.created
    ? "Artifact created."
    : query?.saved
      ? "Artifact saved."
      : null;

  const grouped = groupByType(applicationCase.artifacts);
  const latestByType = Array.from(grouped.entries()).map(([type, artifacts]) => ({
    type,
    latest: artifacts[0],
    count: artifacts.length,
  }));

  const activeArtifactId =
    applicationCase.artifacts[0]?.id ?? latestByType[0]?.latest?.id ?? null;
  const activeArtifact =
    applicationCase.artifacts.find((artifact) => artifact.id === activeArtifactId) ??
    null;

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
        <div>
          <StatusPill>Sprint 6</StatusPill>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">
              Artifacts
            </h1>
            <Link
              href={`/cases/${applicationCase.id}`}
              className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
            >
              Back to case
            </Link>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Create and version artifacts for this case (resume brief, recruiter
            message, referral packet, interview prep, etc.). Generation can be
            added later—this workspace persists the drafts now.
          </p>
          <p className="mt-2 text-xs text-slate-500">
            {applicationCase.opportunity.company} —{" "}
            {applicationCase.opportunity.roleTitle}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Metric label="Total" value={applicationCase.artifacts.length} />
          <Metric label="Types" value={grouped.size} />
        </div>
      </section>

      {message ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          {message}
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <aside className="space-y-6">
          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-950">Create</h2>
            <form action={createArtifact} className="mt-4 grid gap-4">
              <input type="hidden" name="caseId" value={applicationCase.id} />
              <label className="grid gap-2 text-sm">
                <span className="font-medium text-slate-800">Type</span>
                <select
                  name="type"
                  defaultValue="recruiter-message"
                  className="rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-500"
                >
                  {[
                    "strategy-brief",
                    "resume-brief",
                    "referral-packet",
                    "recruiter-message",
                    "hiring-manager-outreach",
                    "interview-prep",
                    "note",
                  ].map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm">
                <span className="font-medium text-slate-800">Title</span>
                <input
                  name="title"
                  placeholder="Recruiter message"
                  className="rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-500"
                />
              </label>
              <label className="grid gap-2 text-sm">
                <span className="font-medium text-slate-800">Content</span>
                <textarea
                  name="content"
                  className="min-h-40 rounded-md border border-slate-300 px-3 py-2 leading-6 outline-none transition focus:border-slate-500"
                  placeholder="Draft in Markdown"
                />
              </label>
              <button
                type="submit"
                className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Save new version
              </button>
            </form>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-950">
              Latest by type
            </h2>
            {latestByType.length === 0 ? (
              <p className="mt-3 text-sm text-slate-600">
                No artifacts yet.
              </p>
            ) : (
              <div className="mt-4 grid gap-3">
                {latestByType.map(({ type, latest, count }) => (
                  <div
                    key={type}
                    className="rounded-lg border border-slate-200 p-4"
                  >
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      {type}
                    </p>
                    <p className="mt-2 text-sm font-medium text-slate-950">
                      {latest.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Versions: {count} · Updated{" "}
                      {formatDateTime(latest.updatedAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </aside>

        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Latest artifact
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Edit and save updates to the latest record.
              </p>
            </div>
          </div>

          {activeArtifact ? (
            <form action={updateArtifact} className="mt-5 grid gap-4">
              <input type="hidden" name="caseId" value={applicationCase.id} />
              <input type="hidden" name="artifactId" value={activeArtifact.id} />

              <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {activeArtifact.type} · v{activeArtifact.version}
                </p>
                <p className="mt-2 text-sm font-medium text-slate-950">
                  {activeArtifact.title}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Updated {formatDateTime(activeArtifact.updatedAt)}
                </p>
              </div>

              <label className="grid gap-2 text-sm">
                <span className="font-medium text-slate-800">Status</span>
                <select
                  name="status"
                  defaultValue={activeArtifact.status}
                  className="rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-500"
                >
                  {["draft", "approved", "used", "archived"].map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm">
                <span className="font-medium text-slate-800">Content</span>
                <textarea
                  name="content"
                  defaultValue={activeArtifact.content}
                  className="min-h-96 rounded-md border border-slate-300 px-3 py-2 font-mono text-sm leading-6 outline-none transition focus:border-slate-500"
                />
              </label>

              <button
                type="submit"
                className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Save artifact
              </button>
            </form>
          ) : (
            <p className="mt-4 text-sm text-slate-600">
              Create an artifact to start drafting.
            </p>
          )}
        </section>
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

