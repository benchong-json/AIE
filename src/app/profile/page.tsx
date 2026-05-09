import { StatusPill } from "@/components/status-pill";
import { prisma } from "@/lib/prisma";
import { saveCandidateProfile, seedBenedictProfile } from "./actions";

export const dynamic = "force-dynamic";

const profileFields = [
  { key: "currentRole", label: "Current role" },
  { key: "location", label: "Location" },
  { key: "targetRoles", label: "Target roles" },
  { key: "constraints", label: "Constraints" },
  { key: "careerNarrative", label: "Career narrative" },
  { key: "evidenceBank", label: "Evidence bank" },
  { key: "voiceProfile", label: "Voice profile" },
  { key: "overclaimBoundaries", label: "Overclaim boundaries" },
] as const;

function completionValue(profile: Awaited<ReturnType<typeof getActiveProfile>>) {
  if (!profile) {
    return { completed: 0, total: profileFields.length, percentage: 0 };
  }

  const completed = profileFields.filter(({ key }) => {
    const value = profile[key];
    return typeof value === "string" && value.trim().length > 0;
  }).length;

  return {
    completed,
    total: profileFields.length,
    percentage: Math.round((completed / profileFields.length) * 100),
  };
}

async function getActiveProfile() {
  const active = await prisma.candidateProfile.findFirst({
    where: { isActive: true },
    include: { candidate: true },
    orderBy: { updatedAt: "desc" },
  });

  if (active) {
    return active;
  }

  return prisma.candidateProfile.findFirst({
    include: { candidate: true },
    orderBy: { updatedAt: "desc" },
  });
}

export default async function ProfilePage({
  searchParams,
}: {
  searchParams?: Promise<{
    saved?: string;
    seeded?: string;
  }>;
}) {
  const params = await searchParams;
  const profile = await getActiveProfile();
  const completion = completionValue(profile);
  const message = params?.seeded
    ? "Benedict profile seeded and loaded."
    : params?.saved
      ? "Candidate profile saved."
      : null;

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
        <div>
          <StatusPill>Sprint 1</StatusPill>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            Candidate Profile
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            This profile is the source of truth for downstream opportunity
            scoring, case strategy, artifact generation, and overclaim
            boundaries.
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-950">
                Profile completeness
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {completion.completed} of {completion.total} core fields
              </p>
            </div>
            <div className="text-2xl font-semibold text-slate-950">
              {completion.percentage}%
            </div>
          </div>
          <div className="mt-4 h-2 rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-emerald-500"
              style={{ width: `${completion.percentage}%` }}
            />
          </div>
        </div>
      </section>

      {message ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          {message}
        </div>
      ) : null}

      {profile ? (
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Active profile
              </p>
              <h2 className="mt-1 text-xl font-semibold text-slate-950">
                {profile.candidate.name}
              </h2>
              <p className="mt-2 text-sm text-slate-600">{profile.title}</p>
            </div>
            <div className="rounded-md border border-slate-200 px-3 py-2 text-xs text-slate-500">
              Updated {profile.updatedAt.toLocaleString()}
            </div>
          </div>
        </section>
      ) : null}

      {!profile ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-950">
            No active profile yet
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Seed Benedict&apos;s profile to start with the current candidate
            context, or fill the form below for a different candidate.
          </p>
          <form action={seedBenedictProfile} className="mt-5">
            <button
              type="submit"
              className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Seed Benedict profile
            </button>
          </form>
        </div>
      ) : null}

      <form
        action={saveCandidateProfile}
        className="grid gap-6 rounded-lg border border-slate-200 bg-white p-5"
      >
        <input type="hidden" name="candidateId" value={profile?.candidateId ?? ""} />
        <input type="hidden" name="profileId" value={profile?.id ?? ""} />

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm">
            <span className="font-medium text-slate-800">Candidate name</span>
            <input
              name="name"
              defaultValue={profile?.candidate.name ?? ""}
              className="rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-500"
              placeholder="Benedict Chong"
            />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="font-medium text-slate-800">Email</span>
            <input
              name="email"
              defaultValue={profile?.candidate.email ?? ""}
              className="rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-500"
              placeholder="optional"
            />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="font-medium text-slate-800">Profile title</span>
            <input
              name="title"
              defaultValue={profile?.title ?? ""}
              className="rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-500"
              placeholder="Candidate positioning title"
            />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="font-medium text-slate-800">Current role</span>
            <input
              name="currentRole"
              defaultValue={profile?.currentRole ?? ""}
              className="rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-500"
              placeholder="Current role and company"
            />
          </label>
          <label className="grid gap-2 text-sm md:col-span-2">
            <span className="font-medium text-slate-800">Location</span>
            <input
              name="location"
              defaultValue={profile?.location ?? ""}
              className="rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-500"
              placeholder="Location, relocation, work authorization notes"
            />
          </label>
        </div>

        <ProfileTextarea
          label="Target roles"
          name="targetRoles"
          defaultValue={profile?.targetRoles}
          placeholder="Role families, industries, levels, company stages, and roles to avoid"
        />
        <ProfileTextarea
          label="Constraints"
          name="constraints"
          defaultValue={profile?.constraints}
          placeholder="Location, compensation, timing, work authorization, non-negotiables"
        />
        <ProfileTextarea
          label="Career narrative"
          name="careerNarrative"
          defaultValue={profile?.careerNarrative}
          placeholder="The story that explains the candidate's arc and next-role objective"
        />
        <ProfileTextarea
          label="Evidence bank"
          name="evidenceBank"
          defaultValue={profile?.evidenceBank}
          placeholder="One proof point per line"
          minHeight="min-h-44"
        />
        <ProfileTextarea
          label="Voice profile"
          name="voiceProfile"
          defaultValue={profile?.voiceProfile}
          placeholder="Tone, phrasing, style, and words to avoid"
        />
        <ProfileTextarea
          label="Overclaim boundaries"
          name="overclaimBoundaries"
          defaultValue={profile?.overclaimBoundaries}
          placeholder="Claims the app should not make without more evidence"
        />
        <ProfileTextarea
          label="Raw markdown profile"
          name="rawMarkdown"
          defaultValue={profile?.rawMarkdown}
          placeholder="Optional canonical Markdown version of the profile"
          minHeight="min-h-44"
        />

        <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-5">
          <button
            type="submit"
            className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Save profile
          </button>
          <button
            formAction={seedBenedictProfile}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Seed / refresh Benedict profile
          </button>
        </div>
      </form>
    </div>
  );
}

function ProfileTextarea({
  label,
  name,
  defaultValue,
  placeholder,
  minHeight = "min-h-32",
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  placeholder: string;
  minHeight?: string;
}) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="font-medium text-slate-800">{label}</span>
      <textarea
        name={name}
        defaultValue={defaultValue ?? ""}
        className={`${minHeight} rounded-md border border-slate-300 px-3 py-2 leading-6 outline-none transition focus:border-slate-500`}
        placeholder={placeholder}
      />
    </label>
  );
}
