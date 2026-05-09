import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusPill } from "@/components/status-pill";
import { generateStrategyBrief, updateCase } from "@/app/cases/actions";
import { caseStatuses, caseStatusLabel } from "@/lib/case-statuses";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getApplicationCase(id: string) {
  return prisma.applicationCase.findUnique({
    where: { id },
    include: {
      candidate: true,
      opportunity: true,
      artifacts: {
        where: { type: "strategy-brief" },
        orderBy: { version: "desc" },
        take: 1,
      },
      timeline: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function dateInputValue(date: Date | null) {
  if (!date) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

export default async function CaseDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{
    created?: string;
    existing?: string;
    saved?: string;
    strategy?: string;
    error?: string;
  }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const applicationCase = await getApplicationCase(id);

  if (!applicationCase) {
    notFound();
  }

  const message = query?.created
    ? "Case created from opportunity."
    : query?.existing
      ? "This opportunity already has a case."
      : query?.saved
        ? "Case saved."
        : query?.strategy
          ? "Strategy brief generated."
        : null;

  const errorMessage =
    query?.error === "llm-missing-key"
      ? "LLM is not configured. Set LLM_PROVIDER plus GEMINI_API_KEY (or OPENAI_API_KEY) in personal-recruiter-app/.env and restart the dev server."
      : query?.error === "strategy-failed"
        ? "Strategy generation failed. Check your LLM configuration (and quota) and try again."
        : query?.error
          ? `Error: ${query.error}`
          : null;

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill>{caseStatusLabel(applicationCase.status)}</StatusPill>
            <Link
              href="/cases"
              className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
            >
              Back to cases
            </Link>
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            {applicationCase.title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            {applicationCase.opportunity.company} -{" "}
            {applicationCase.opportunity.roleTitle}
            {applicationCase.opportunity.location
              ? ` - ${applicationCase.opportunity.location}`
              : ""}
            {applicationCase.opportunity.workModel
              ? ` - ${applicationCase.opportunity.workModel}`
              : ""}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-950">Next action</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {applicationCase.nextAction || "No next action saved."}
          </p>
          <p className="mt-4 text-xs text-slate-500">
            Follow-up:{" "}
            {applicationCase.followUpAt
              ? dateInputValue(applicationCase.followUpAt)
              : "Not set"}
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

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <form
            action={updateCase}
            className="rounded-lg border border-slate-200 bg-white p-5"
          >
            <input type="hidden" name="caseId" value={applicationCase.id} />
            <h2 className="text-lg font-semibold text-slate-950">
              Case workspace
            </h2>
            <div className="mt-5 grid gap-5">
              <label className="grid gap-2 text-sm">
                <span className="font-medium text-slate-800">Status</span>
                <select
                  name="status"
                  defaultValue={applicationCase.status}
                  className="rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-500"
                >
                  {caseStatuses.map((status) => (
                    <option key={status} value={status}>
                      {caseStatusLabel(status)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm">
                <span className="font-medium text-slate-800">Next action</span>
                <input
                  name="nextAction"
                  defaultValue={applicationCase.nextAction ?? ""}
                  className="rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-500"
                  placeholder="Ask for referral, generate strategy brief, tailor CV"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm">
                  <span className="font-medium text-slate-800">
                    Follow-up date
                  </span>
                  <input
                    type="date"
                    name="followUpAt"
                    defaultValue={dateInputValue(applicationCase.followUpAt)}
                    className="rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-500"
                  />
                </label>
                <label className="grid gap-2 text-sm">
                  <span className="font-medium text-slate-800">Outcome</span>
                  <input
                    name="outcome"
                    defaultValue={applicationCase.outcome ?? ""}
                    className="rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-500"
                    placeholder="Pending, applied, rejected, offer"
                  />
                </label>
              </div>

              <label className="grid gap-2 text-sm">
                <span className="font-medium text-slate-800">Notes</span>
                <textarea
                  name="notes"
                  defaultValue={applicationCase.notes ?? ""}
                  className="min-h-64 rounded-md border border-slate-300 px-3 py-2 leading-6 outline-none transition focus:border-slate-500"
                  placeholder="Capture research, referral ideas, positioning notes, risks, and decisions."
                />
              </label>

              <div>
                <button
                  type="submit"
                  className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Save case
                </button>
              </div>
            </div>
          </form>

          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  Strategy brief
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Generate a structured application strategy from the active
                  profile and the job posting.
                </p>
              </div>
              <form action={generateStrategyBrief}>
                <input type="hidden" name="caseId" value={applicationCase.id} />
                <button
                  type="submit"
                  className="w-fit rounded-md bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Generate strategy brief
                </button>
              </form>
            </div>

            {applicationCase.artifacts[0] ? (
              <div className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Latest saved brief
                </p>
                <p className="mt-1 text-sm font-medium text-slate-950">
                  {applicationCase.artifacts[0].title}
                </p>
                <pre className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {applicationCase.artifacts[0].content}
                </pre>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-600">
                No strategy brief yet. Generate one to kick off deeper work on
                this case.
              </p>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-950">
              Opportunity source
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              <Info label="Company" value={applicationCase.opportunity.company} />
              <Info
                label="Role"
                value={applicationCase.opportunity.roleTitle}
              />
              <Info
                label="Source"
                value={applicationCase.opportunity.sourceType || "Not specified"}
              />
            </dl>
            {applicationCase.opportunity.sourceUrl ? (
              <a
                href={applicationCase.opportunity.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Open posting
              </a>
            ) : null}
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-950">Artifacts</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Draft and version the resume brief, recruiter message, referral
              packet, interview prep, and other case artifacts.
            </p>
            <Link
              href={`/cases/${applicationCase.id}/artifacts`}
              className="mt-4 inline-flex rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Open artifacts workspace
            </Link>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-950">
              Retrospective
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Capture lessons from this case so the workflow improves over time.
            </p>
            <Link
              href={`/cases/${applicationCase.id}/retrospective`}
              className="mt-4 inline-flex rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Open retrospective
            </Link>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-950">
              Company research
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Pull and store source-backed company signals with Exa.
            </p>
            <Link
              href={`/cases/${applicationCase.id}/research`}
              className="mt-4 inline-flex rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Open research
            </Link>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-950">Timeline</h2>
            {applicationCase.timeline.length === 0 ? (
              <p className="mt-4 text-sm text-slate-600">No updates yet.</p>
            ) : (
              <ol className="mt-4 space-y-4">
                {applicationCase.timeline.map((event) => (
                  <li key={event.id} className="border-l border-slate-200 pl-4">
                    <p className="text-sm font-medium text-slate-950">
                      {event.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatDateTime(event.createdAt)}
                    </p>
                    {event.description ? (
                      <p className="mt-2 text-sm leading-5 text-slate-600">
                        {event.description}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ol>
            )}
          </section>
        </aside>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-950">
          Job description
        </h2>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600">
          {applicationCase.opportunity.jobDescription}
        </p>
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 text-slate-800">{value}</dd>
    </div>
  );
}
