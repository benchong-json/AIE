"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function createOpportunity(formData: FormData) {
  const company = value(formData, "company");
  const roleTitle = value(formData, "roleTitle");
  const sourceUrl = value(formData, "sourceUrl") || null;
  const jobDescription = value(formData, "jobDescription");

  if (!company || !roleTitle || !jobDescription) {
    redirect("/opportunities?error=missing-required");
  }

  const activeProfile = await prisma.candidateProfile.findFirst({
    where: { isActive: true },
    orderBy: { updatedAt: "desc" },
  });

  const opportunity = await prisma.opportunity.create({
    data: {
      candidateId: activeProfile?.candidateId ?? null,
      company,
      roleTitle,
      sourceUrl,
      location: value(formData, "location") || null,
      workModel: value(formData, "workModel") || null,
      sourceType: value(formData, "sourceType") || null,
      jobDescription,
      status: "new",
    },
  });

  revalidatePath("/opportunities");
  redirect(`/opportunities?created=${opportunity.id}`);
}

export async function updateOpportunityStatus(formData: FormData) {
  const opportunityId = value(formData, "opportunityId");
  const status = value(formData, "status");

  if (!opportunityId || !status) {
    redirect("/opportunities?error=missing-status");
  }

  await prisma.opportunity.update({
    where: { id: opportunityId },
    data: { status },
  });

  revalidatePath("/opportunities");
  redirect("/opportunities?updated=1");
}
