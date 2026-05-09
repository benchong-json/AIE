import Link from "next/link";
import { StatusPill } from "@/components/status-pill";
import { prisma } from "@/lib/prisma";
import { createCaseFromOpportunity } from "@/app/cases/actions";
import { createOpportunity, updateOpportunityStatus } from "./actions";

export const dynamic = "force-dynamic";

const statuses = ["new", "shortlisted", "skipped", "converted-to-case"];

async function getOpportunities() {
  return prisma.opportunity.findMany({
    include: {
      cases: {
        select: {
          id: true,
          status: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

async function getPotentialDuplicates() {
  const opportunities = await prisma.opportunity.findMany({
    select: {
      id: true,
      company: true,
      roleTitle: true,
      sourceUrl: true,
    },
  });

  const seen = new Map<string, typeof opportunities>();

  for (const opportunity of opportunities) {
    const key = [
      opportunity.company.toLowerCase(),
      opportunity.roleTitle.toLowerCase(),
      opportunity.sourceUrl?.toLowerCase() ?? "",
    ].join("::");
    seen.set(key, [...(seen.get(key) ?? []), opportunity]);
  }

  return Array.from(seen.values()).filter((group) => group.length > 1).flat();
}

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams?: Promise<{
    created?: string;
    updated?: string;
    error?: string;
  }>;
}) {
  const params = await searchParams;
  const [opportunities, duplicates] = await Promise.all([
    getOpportunities(),
    getPotentialDuplicates(),
  ]);

  const message = params?.created
    ? "Opportunity saved."
    : params?.updated
      ? "Opportunity status updated."
      : params?.error === "missing-candidate"
        ? "Create or seed an active profile before converting an opportunity."
      : params?.error === "missing-required"
        ? "Company, role title, and job description are required."
        : null;

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
        <div>
          <StatusPill>Sprint 2</StatusPill>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            Opportunities
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Paste a job posting manually, normalize the core metadata, and save
            it as an opportunity before creating an application case.
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-950">Saved roles</p>
          <p className="mt-1 text-3xl font-semibold text-slate-950">
            {opportunities.length}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            {duplicates.length > 0
              ? `${duplicates.length} possible duplicate records`
              : "No duplicates detected"}
          </p>
        </div>
      </section>

      {message ? (
        <div
          className={`rounded-lg border px-4 py-3 text-sm font-medium ${
            params?.error
              ? "border-rose-200 bg-rose-50 text-rose-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          {message}
        </div>
      ) : null}

      {duplicates.length > 0 ? (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-sm font-semibold text-amber-950">
            Possible duplicates
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-amber-900">
            {duplicates.map((opportunity) => (
              <li key={opportunity.id}>
                {opportunity.company} - {opportunity.roleTitle}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-950">
          Add opportunity
        </h2>
        <form action={createOpportunity} className="mt-5 grid gap-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Company" name="company" required placeholder="Siro" />
            <Field
              label="Role title"
              name="roleTitle"
              required
              placeholder="GTM AI Engineer"
            />
            <Field
              label="Job URL"
              name="sourceUrl"
              placeholder="https://..."
              type="url"
            />
            <Field
              label="Location"
              name="location"
              placeholder="New York, Singapore, Remote"
            />
            <Field
              label="Work model"
              name="workModel"
              placeholder="Hybrid, remote, onsite"
            />
            <Field
              label="Source"
              name="sourceType"
              placeholder="LinkedIn, company careers, referral"
            />
          </div>
          <label className="grid gap-2 text-sm">
            <span className="font-medium text-slate-800">
              Job description <span className="text-rose-600">*</span>
            </span>
            <textarea
              name="jobDescription"
              required
              className="min-h-56 rounded-md border border-slate-300 px-3 py-2 leading-6 outline-none transition focus:border-slate-500"
              placeholder="Paste the full job description here."
            />
          </label>
          <div>
            <button
              type="submit"
              className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Save opportunity
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-lg font-semibold text-slate-950">
            Opportunity list
          </h2>
        </div>
        {opportunities.length === 0 ? (
          <div className="p-5 text-sm text-slate-600">
            No opportunities saved yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {opportunities.map((opportunity) => (
              <article key={opportunity.id} className="grid gap-4 p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-slate-950">
                      {opportunity.roleTitle}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {opportunity.company}
                      {opportunity.location ? ` - ${opportunity.location}` : ""}
                      {opportunity.workModel ? ` - ${opportunity.workModel}` : ""}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      Source: {opportunity.sourceType || "Not specified"}
                      {opportunity.sourceUrl ? " | URL saved" : ""}
                    </p>
                  </div>
                  <form action={updateOpportunityStatus} className="flex gap-2">
                    <input
                      type="hidden"
                      name="opportunityId"
                      value={opportunity.id}
                    />
                    <select
                      name="status"
                      defaultValue={opportunity.status}
                      className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      Update
                    </button>
                  </form>
                </div>
                <p className="line-clamp-3 text-sm leading-6 text-slate-600">
                  {opportunity.jobDescription}
                </p>
                <div className="flex flex-wrap gap-2">
                  {opportunity.sourceUrl ? (
                    <a
                      href={opportunity.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      Open posting
                    </a>
                  ) : null}
                  {opportunity.cases[0] ? (
                    <Link
                      href={`/cases/${opportunity.cases[0].id}`}
                      className="rounded-md bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                    >
                      Open case
                    </Link>
                  ) : (
                    <form action={createCaseFromOpportunity}>
                      <input
                        type="hidden"
                        name="opportunityId"
                        value={opportunity.id}
                      />
                      <button
                        type="submit"
                        className="rounded-md bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                      >
                        Create case
                      </button>
                    </form>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Field({
  label,
  name,
  placeholder,
  required = false,
  type = "text",
}: {
  label: string;
  name: string;
  placeholder: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="font-medium text-slate-800">
        {label}
        {required ? <span className="text-rose-600"> *</span> : null}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        className="rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-500"
        placeholder={placeholder}
      />
    </label>
  );
}
