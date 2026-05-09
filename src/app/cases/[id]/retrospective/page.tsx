import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusPill } from "@/components/status-pill";
import { prisma } from "@/lib/prisma";
import { saveRetrospective } from "./actions";

export const dynamic = "force-dynamic";

async function getCaseWithRetrospective(caseId: string) {
  return prisma.applicationCase.findUnique({
    where: { id: caseId },
    include: {
      opportunity: true,
      learnings: {
        orderBy: { updatedAt: "desc" },
        take: 1,
      },
    },
  });
}

export default async function RetrospectivePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ saved?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const applicationCase = await getCaseWithRetrospective(id);

  if (!applicationCase) {
    notFound();
  }

  const learning = applicationCase.learnings[0] ?? null;

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
        <div>
          <StatusPill>Sprint 8</StatusPill>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">
              Retrospective
            </h1>
            <Link
              href={`/cases/${applicationCase.id}`}
              className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
            >
              Back to case
            </Link>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Capture what worked, what failed, and what should change in your
            profile or reusable skills. This is the learning loop that improves
            future recommendations.
          </p>
          <p className="mt-2 text-xs text-slate-500">
            {applicationCase.opportunity.company} —{" "}
            {applicationCase.opportunity.roleTitle}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-950">Current status</p>
          <p className="mt-2 text-sm text-slate-600">
            {learning ? learning.status : "No retrospective saved yet"}
          </p>
        </div>
      </section>

      {query?.saved ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          Retrospective saved.
        </div>
      ) : null}

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-950">Write-up</h2>
        <form action={saveRetrospective} className="mt-5 grid gap-5">
          <input type="hidden" name="caseId" value={applicationCase.id} />

          <label className="grid gap-2 text-sm">
            <span className="font-medium text-slate-800">Summary</span>
            <textarea
              name="summary"
              defaultValue={learning?.summary ?? ""}
              className="min-h-28 rounded-md border border-slate-300 px-3 py-2 leading-6 outline-none transition focus:border-slate-500"
              placeholder="One paragraph: what happened and what you learned."
              required
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium text-slate-800">
              Lessons (optional)
            </span>
            <textarea
              name="lessons"
              defaultValue={learning?.lessons ?? ""}
              className="min-h-80 rounded-md border border-slate-300 px-3 py-2 font-mono text-sm leading-6 outline-none transition focus:border-slate-500"
              placeholder={`Suggested structure:\n- What worked\n- What failed\n- What to change (profile vs skill vs template)\n- Next time: rules of thumb`}
            />
          </label>

          <label className="grid gap-2 text-sm md:max-w-xs">
            <span className="font-medium text-slate-800">Status</span>
            <select
              name="status"
              defaultValue={learning?.status ?? "draft"}
              className="rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-500"
            >
              {["draft", "final"].map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            className="w-fit rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Save retrospective
          </button>
        </form>
      </section>
    </div>
  );
}

