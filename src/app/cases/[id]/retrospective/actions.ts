"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function saveRetrospective(formData: FormData) {
  const caseId = value(formData, "caseId");
  const summary = value(formData, "summary");
  const lessons = value(formData, "lessons") || null;
  const status = value(formData, "status") || "draft";

  if (!caseId || !summary) {
    redirect(`/cases/${caseId}?error=missing-retrospective`);
  }

  const existing = await prisma.caseLearning.findFirst({
    where: { caseId },
    orderBy: { updatedAt: "desc" },
    select: { id: true },
  });

  if (existing) {
    await prisma.caseLearning.update({
      where: { id: existing.id },
      data: { summary, lessons, status },
    });
  } else {
    await prisma.caseLearning.create({
      data: { caseId, summary, lessons, status },
    });
  }

  await prisma.caseTimelineEvent.create({
    data: {
      caseId,
      type: "retrospective-saved",
      title: "Retrospective saved",
      description: status === "final" ? "Marked as final." : "Draft updated.",
    },
  });

  revalidatePath(`/cases/${caseId}`);
  revalidatePath(`/cases/${caseId}/retrospective`);
  redirect(`/cases/${caseId}/retrospective?saved=1`);
}

