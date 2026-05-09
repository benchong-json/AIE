"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { assertLlmConfigured, generateJson } from "@/lib/llm";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

async function getFallbackCandidateId() {
  const activeProfile = await prisma.candidateProfile.findFirst({
    where: { isActive: true },
    orderBy: { updatedAt: "desc" },
    select: { candidateId: true },
  });

  return activeProfile?.candidateId ?? null;
}

export async function createCaseFromOpportunity(formData: FormData) {
  const opportunityId = value(formData, "opportunityId");

  if (!opportunityId) {
    redirect("/opportunities?error=missing-opportunity");
  }

  const opportunity = await prisma.opportunity.findUnique({
    where: { id: opportunityId },
    include: { cases: true },
  });

  if (!opportunity) {
    redirect("/opportunities?error=opportunity-not-found");
  }

  const existingCase = opportunity.cases[0];
  if (existingCase) {
    redirect(`/cases/${existingCase.id}?existing=1`);
  }

  const candidateId = opportunity.candidateId ?? (await getFallbackCandidateId());
  if (!candidateId) {
    redirect("/opportunities?error=missing-candidate");
  }

  const applicationCase = await prisma.applicationCase.create({
    data: {
      candidateId,
      opportunityId: opportunity.id,
      title: `${opportunity.company} - ${opportunity.roleTitle}`,
      status: "researching",
      nextAction: "Review the role and generate an application strategy brief.",
      timeline: {
        create: {
          type: "created",
          title: "Case created",
          description: `Converted ${opportunity.company} - ${opportunity.roleTitle} from opportunity intake.`,
        },
      },
    },
  });

  await prisma.opportunity.update({
    where: { id: opportunity.id },
    data: { status: "converted-to-case" },
  });

  revalidatePath("/opportunities");
  revalidatePath("/cases");
  redirect(`/cases/${applicationCase.id}?created=1`);
}

export async function updateCase(formData: FormData) {
  const caseId = value(formData, "caseId");
  const status = value(formData, "status");
  const notes = value(formData, "notes") || null;
  const nextAction = value(formData, "nextAction") || null;
  const outcome = value(formData, "outcome") || null;
  const followUpValue = value(formData, "followUpAt");

  if (!caseId || !status) {
    redirect("/cases?error=missing-case");
  }

  const followUpAt = followUpValue ? new Date(`${followUpValue}T09:00:00`) : null;

  await prisma.$transaction([
    prisma.applicationCase.update({
      where: { id: caseId },
      data: {
        status,
        notes,
        nextAction,
        outcome,
        followUpAt,
      },
    }),
    prisma.caseTimelineEvent.create({
      data: {
        caseId,
        type: "updated",
        title: "Case updated",
        description: nextAction
          ? `Status set to ${status}. Next action: ${nextAction}`
          : `Status set to ${status}.`,
      },
    }),
  ]);

  revalidatePath("/cases");
  revalidatePath(`/cases/${caseId}`);
  redirect(`/cases/${caseId}?saved=1`);
}

type StrategyBrief = {
  recommendation?: { decision?: string; rationale?: string };
  scores?: { fit?: number; upside?: number; risk?: number; access?: number };
  companyProblemHypotheses?: string[];
  roleDeconstruction?: string[];
  positioningThesis?: string;
  applicationPathRecommendation?: string;
  documentsNeeded?: string[];
  accessStrategy?: string;
  missingEvidence?: string[];
  nextActions?: string[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function renderStrategyBriefMarkdown(strategy: StrategyBrief) {
  const lines: string[] = [];
  const push = (value?: string) => {
    if (value) lines.push(value);
  };

  push(`# Application Strategy Brief`);
  push(``);
  push(`## Recommendation`);
  push(`- **Decision**: ${strategy?.recommendation?.decision ?? "Unknown"}`);
  push(`- **Rationale**: ${strategy?.recommendation?.rationale ?? "Not provided"}`);
  push(``);
  push(`## Scores`);
  push(`- **Fit**: ${strategy?.scores?.fit ?? "N/A"}`);
  push(`- **Upside**: ${strategy?.scores?.upside ?? "N/A"}`);
  push(`- **Risk**: ${strategy?.scores?.risk ?? "N/A"}`);
  push(`- **Access**: ${strategy?.scores?.access ?? "N/A"}`);
  push(``);

  if (Array.isArray(strategy?.companyProblemHypotheses) && strategy.companyProblemHypotheses.length) {
    push(`## Company problem hypotheses`);
    for (const item of strategy.companyProblemHypotheses) {
      push(`- ${String(item)}`);
    }
    push(``);
  }

  if (Array.isArray(strategy?.roleDeconstruction) && strategy.roleDeconstruction.length) {
    push(`## Role deconstruction`);
    for (const item of strategy.roleDeconstruction) {
      push(`- ${String(item)}`);
    }
    push(``);
  }

  if (strategy?.positioningThesis) {
    push(`## Positioning thesis`);
    push(String(strategy.positioningThesis));
    push(``);
  }

  if (strategy?.applicationPathRecommendation) {
    push(`## Application path`);
    push(String(strategy.applicationPathRecommendation));
    push(``);
  }

  if (Array.isArray(strategy?.documentsNeeded) && strategy.documentsNeeded.length) {
    push(`## Documents / artifacts needed`);
    for (const item of strategy.documentsNeeded) {
      push(`- ${String(item)}`);
    }
    push(``);
  }

  if (strategy?.accessStrategy) {
    push(`## Access strategy`);
    push(String(strategy.accessStrategy));
    push(``);
  }

  if (Array.isArray(strategy?.missingEvidence) && strategy.missingEvidence.length) {
    push(`## Missing evidence / risks`);
    for (const item of strategy.missingEvidence) {
      push(`- ${String(item)}`);
    }
    push(``);
  }

  if (Array.isArray(strategy?.nextActions) && strategy.nextActions.length) {
    push(`## Next actions`);
    for (const item of strategy.nextActions) {
      push(`- ${String(item)}`);
    }
    push(``);
  }

  return `${lines.join("\n")}\n`;
}

function buildStrategyPrompt(input: {
  candidateProfileMarkdown: string;
  opportunity: {
    company: string;
    roleTitle: string;
    location?: string | null;
    workModel?: string | null;
    sourceUrl?: string | null;
    sourceType?: string | null;
    jobDescription: string;
  };
}) {
  return [
    `You are an experienced personal recruiter. Produce a recruiter-grade, candidate-specific strategy brief.`,
    ``,
    `Hard rules:`,
    `- Do NOT invent candidate experience. Use only the Candidate Profile provided.`,
    `- If evidence is missing, call it out explicitly in missingEvidence.`,
    `- Be direct: recommend pursue, referral-only, monitor, or skip.`,
    `- Output MUST be valid JSON only (no markdown, no extra text).`,
    ``,
    `Return JSON with this schema:`,
    `{`,
    `  "recommendation": { "decision": "pursue|referral-only|monitor|skip", "rationale": "string" },`,
    `  "scores": { "fit": 0-10, "upside": 0-10, "risk": 0-10, "access": 0-10 },`,
    `  "companyProblemHypotheses": ["string", "..."],`,
    `  "roleDeconstruction": ["string", "..."],`,
    `  "positioningThesis": "string",`,
    `  "applicationPathRecommendation": "string",`,
    `  "documentsNeeded": ["string", "..."],`,
    `  "accessStrategy": "string",`,
    `  "missingEvidence": ["string", "..."],`,
    `  "nextActions": ["string", "..."]`,
    `}`,
    ``,
    `Candidate Profile (markdown):`,
    input.candidateProfileMarkdown,
    ``,
    `Opportunity:`,
    `- Company: ${input.opportunity.company}`,
    `- Role title: ${input.opportunity.roleTitle}`,
    input.opportunity.location ? `- Location: ${input.opportunity.location}` : null,
    input.opportunity.workModel ? `- Work model: ${input.opportunity.workModel}` : null,
    input.opportunity.sourceType ? `- Source: ${input.opportunity.sourceType}` : null,
    input.opportunity.sourceUrl ? `- Posting URL: ${input.opportunity.sourceUrl}` : null,
    ``,
    `Job description (verbatim):`,
    input.opportunity.jobDescription,
  ]
    .filter(Boolean)
    .join("\n");
}

export async function generateStrategyBrief(formData: FormData) {
  const caseId = value(formData, "caseId");
  if (!caseId) {
    redirect("/cases?error=missing-case");
  }

  try {
    assertLlmConfigured();
  } catch {
    redirect(`/cases/${caseId}?error=llm-missing-key`);
  }

  const applicationCase = await prisma.applicationCase.findUnique({
    where: { id: caseId },
    include: {
      opportunity: true,
      candidate: {
        include: {
          profiles: {
            where: { isActive: true },
            orderBy: { updatedAt: "desc" },
            take: 1,
          },
        },
      },
      artifacts: {
        where: { type: "strategy-brief" },
        orderBy: { version: "desc" },
        take: 1,
      },
    },
  });

  if (!applicationCase) {
    redirect("/cases?error=case-not-found");
  }

  const activeProfile = applicationCase.candidate.profiles[0];
  const candidateProfileMarkdown =
    activeProfile?.rawMarkdown ||
    [activeProfile?.careerNarrative, activeProfile?.targetRoles, activeProfile?.evidenceBank]
      .filter(Boolean)
      .join("\n\n") ||
    "No candidate profile is available.";

  const runInput = JSON.stringify(
    {
      caseId: applicationCase.id,
      candidateId: applicationCase.candidateId,
      opportunity: {
        company: applicationCase.opportunity.company,
        roleTitle: applicationCase.opportunity.roleTitle,
        location: applicationCase.opportunity.location,
        workModel: applicationCase.opportunity.workModel,
        sourceUrl: applicationCase.opportunity.sourceUrl,
        sourceType: applicationCase.opportunity.sourceType,
      },
    },
    null,
    2,
  );

  const agentRun = await prisma.agentRun.create({
    data: {
      caseId: applicationCase.id,
      runType: "strategy-brief",
      status: "running",
      input: runInput,
    },
  });

  try {
    const prompt = buildStrategyPrompt({
      candidateProfileMarkdown,
      opportunity: {
        company: applicationCase.opportunity.company,
        roleTitle: applicationCase.opportunity.roleTitle,
        location: applicationCase.opportunity.location,
        workModel: applicationCase.opportunity.workModel,
        sourceUrl: applicationCase.opportunity.sourceUrl,
        sourceType: applicationCase.opportunity.sourceType,
        jobDescription: applicationCase.opportunity.jobDescription,
      },
    });

    const { text: outputText, json: parsed } = await generateJson(prompt);
    const outputJson = parsed ?? { error: "Invalid JSON output", raw: outputText };
    const strategy: StrategyBrief = isRecord(parsed) ? (parsed as StrategyBrief) : {};
    const markdown = renderStrategyBriefMarkdown(strategy);

    const previousVersion = applicationCase.artifacts[0]?.version ?? 0;
    const nextVersion = previousVersion + 1;

    await prisma.$transaction([
      prisma.agentRun.update({
        where: { id: agentRun.id },
        data: {
          status: "completed",
          output: JSON.stringify(outputJson, null, 2),
        },
      }),
      prisma.artifact.create({
        data: {
          caseId: applicationCase.id,
          type: "strategy-brief",
          title: `Application Strategy Brief (v${nextVersion})`,
          content: markdown,
          status: "draft",
          version: nextVersion,
        },
      }),
      prisma.caseTimelineEvent.create({
        data: {
          caseId: applicationCase.id,
          type: "strategy-generated",
          title: "Strategy brief generated",
          description: `Created strategy brief version ${nextVersion}.`,
        },
      }),
    ]);

    revalidatePath(`/cases/${applicationCase.id}`);
    redirect(`/cases/${applicationCase.id}?strategy=1`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await prisma.agentRun.update({
      where: { id: agentRun.id },
      data: {
        status: "failed",
        error: message,
      },
    });
    revalidatePath(`/cases/${applicationCase.id}`);
    redirect(`/cases/${applicationCase.id}?error=strategy-failed`);
  }
}
