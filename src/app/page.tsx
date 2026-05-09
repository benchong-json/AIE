import Link from "next/link";
import { StatusPill } from "@/components/status-pill";

export default function Home() {
  const workflow = [
    {
      step: "Sprint 1",
      title: "Candidate Profile",
      description:
        "Load the candidate context, evidence bank, voice, constraints, and overclaim boundaries.",
      href: "/profile",
    },
    {
      step: "Sprint 2",
      title: "Opportunity Intake",
      description:
        "Paste a job posting and normalize it into an opportunity record.",
      href: "/opportunities",
    },
    {
      step: "Sprint 3",
      title: "Application Cases",
      description:
        "Convert selected opportunities into case workspaces with status, notes, and next actions.",
      href: "/cases",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr] lg:items-end">
        <div>
          <StatusPill>Sprint 0 foundation</StatusPill>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950">
            Build the manual application case workflow before automating sourcing.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            The MVP proves whether a candidate profile and one job posting can
            produce a recruiter-grade strategy, useful artifacts, and a clean
            pipeline record.
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-950">MVP target</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Paste a job posting, create a case, generate a strategy brief, draft
            artifacts, track status, and run a retrospective.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {workflow.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-lg border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm"
          >
            <StatusPill>{item.step}</StatusPill>
            <h2 className="mt-4 text-lg font-semibold text-slate-950">
              {item.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {item.description}
            </p>
          </Link>
        ))}
      </section>
    </div>
  );
}
