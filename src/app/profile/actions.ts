"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { benedictProfileSeed, benedictRawMarkdown } from "@/lib/seed-profile";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function saveCandidateProfile(formData: FormData) {
  const candidateId = value(formData, "candidateId");
  const profileId = value(formData, "profileId");
  const name = value(formData, "name") || "Candidate";
  const email = value(formData, "email") || null;

  const profileData = {
    title: value(formData, "title") || "Candidate Profile",
    currentRole: value(formData, "currentRole") || null,
    location: value(formData, "location") || null,
    targetRoles: value(formData, "targetRoles") || "To define",
    constraints: value(formData, "constraints") || null,
    careerNarrative: value(formData, "careerNarrative") || null,
    evidenceBank: value(formData, "evidenceBank") || null,
    voiceProfile: value(formData, "voiceProfile") || null,
    overclaimBoundaries: value(formData, "overclaimBoundaries") || null,
    rawMarkdown: value(formData, "rawMarkdown") || null,
    isActive: true,
  };

  await prisma.$transaction(async (tx) => {
    const candidate = candidateId
      ? await tx.candidate.update({
          where: { id: candidateId },
          data: { name, email },
        })
      : await tx.candidate.create({
          data: { name, email },
        });

    await tx.candidateProfile.updateMany({
      where: { candidateId: candidate.id },
      data: { isActive: false },
    });

    if (profileId) {
      await tx.candidateProfile.update({
        where: { id: profileId },
        data: profileData,
      });
    } else {
      await tx.candidateProfile.create({
        data: {
          ...profileData,
          candidateId: candidate.id,
        },
      });
    }
  });

  revalidatePath("/profile");
  redirect("/profile?saved=1");
}

export async function seedBenedictProfile() {
  const existing = await prisma.candidate.findFirst({
    where: { name: benedictProfileSeed.candidate.name },
    include: { profiles: true },
  });

  await prisma.$transaction(async (tx) => {
    const candidate =
      existing ??
      (await tx.candidate.create({
        data: benedictProfileSeed.candidate,
        include: { profiles: true },
      }));

    await tx.candidateProfile.updateMany({
      where: { candidateId: candidate.id },
      data: { isActive: false },
    });

    const activeProfile = candidate.profiles[0];

    if (activeProfile) {
      await tx.candidateProfile.update({
        where: { id: activeProfile.id },
        data: {
          ...benedictProfileSeed.profile,
          rawMarkdown: benedictRawMarkdown,
          isActive: true,
        },
      });
    } else {
      await tx.candidateProfile.create({
        data: {
          ...benedictProfileSeed.profile,
          rawMarkdown: benedictRawMarkdown,
          isActive: true,
          candidateId: candidate.id,
        },
      });
    }
  });

  revalidatePath("/profile");
  redirect("/profile?seeded=1");
}
