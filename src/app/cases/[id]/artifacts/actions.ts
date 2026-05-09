"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function createArtifact(formData: FormData) {
  const caseId = value(formData, "caseId");
  const type = value(formData, "type") || "note";
  const title = value(formData, "title") || "Artifact";
  const content = value(formData, "content") || "";

  if (!caseId) {
    redirect("/cases?error=missing-case");
  }

  const latest = await prisma.artifact.findFirst({
    where: { caseId, type },
    orderBy: { version: "desc" },
    select: { version: true },
  });
  const nextVersion = (latest?.version ?? 0) + 1;

  const artifact = await prisma.artifact.create({
    data: {
      caseId,
      type,
      title: `${title} (v${nextVersion})`,
      content,
      status: "draft",
      version: nextVersion,
    },
  });

  await prisma.caseTimelineEvent.create({
    data: {
      caseId,
      type: "artifact-created",
      title: "Artifact created",
      description: `${type} version ${nextVersion} saved.`,
    },
  });

  revalidatePath(`/cases/${caseId}`);
  revalidatePath(`/cases/${caseId}/artifacts`);
  redirect(`/cases/${caseId}/artifacts?created=${artifact.id}`);
}

export async function updateArtifact(formData: FormData) {
  const caseId = value(formData, "caseId");
  const artifactId = value(formData, "artifactId");
  const status = value(formData, "status") || "draft";
  const content = value(formData, "content") || "";

  if (!caseId || !artifactId) {
    redirect("/cases?error=missing-case");
  }

  await prisma.artifact.update({
    where: { id: artifactId },
    data: { status, content },
  });

  await prisma.caseTimelineEvent.create({
    data: {
      caseId,
      type: "artifact-updated",
      title: "Artifact updated",
      description: `Artifact ${artifactId} saved.`,
    },
  });

  revalidatePath(`/cases/${caseId}`);
  revalidatePath(`/cases/${caseId}/artifacts`);
  redirect(`/cases/${caseId}/artifacts?saved=1`);
}

