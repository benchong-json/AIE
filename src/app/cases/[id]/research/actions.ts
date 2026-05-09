"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getExaClient } from "@/lib/exa";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

type ExaResult = {
  url: string;
  title?: string;
  snippet?: string;
  publishedDate?: string;
  highlights?: string[];
  summary?: string;
};

function formatDate(date: Date | null) {
  if (!date) return "Unknown";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function markdownForCategory(category: string, results: ExaResult[]) {
  const lines: string[] = [];
  lines.push(`## ${category}`);
  lines.push("");

  if (results.length === 0) {
    lines.push("- No results found.");
    lines.push("");
    return lines.join("\n");
  }

  for (const result of results) {
    lines.push(`- **${result.title ?? result.url}**`);
    lines.push(`  - URL: ${result.url}`);
    if (result.publishedDate) lines.push(`  - Published: ${result.publishedDate}`);
    if (result.snippet) lines.push(`  - Snippet: ${result.snippet}`);
    if (Array.isArray(result.highlights) && result.highlights.length) {
      const highlights = result.highlights.slice(0, 3);
      lines.push(`  - Highlights:`);
      for (const highlight of highlights) {
        lines.push(`    - ${highlight}`);
      }
    }
    if (result.summary) {
      lines.push(`  - Summary: ${result.summary}`);
    }
  }

  lines.push("");
  return lines.join("\n");
}

function toDate(value: string | undefined) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export async function runCompanyResearch(formData: FormData) {
  const caseId = value(formData, "caseId");
  if (!caseId) {
    redirect("/cases?error=missing-case");
  }

  try {
    getExaClient();
  } catch {
    redirect(`/cases/${caseId}?error=exa-missing-key`);
  }

  const applicationCase = await prisma.applicationCase.findUnique({
    where: { id: caseId },
    include: {
      opportunity: true,
      artifacts: {
        where: { type: "company-research" },
        orderBy: { version: "desc" },
        take: 1,
      },
    },
  });

  if (!applicationCase) {
    redirect(`/cases?error=case-not-found`);
  }

  const company = applicationCase.opportunity.company;
  const roleTitle = applicationCase.opportunity.roleTitle;

  const agentRun = await prisma.agentRun.create({
    data: {
      caseId: applicationCase.id,
      runType: "company-research",
      status: "running",
      input: JSON.stringify({ company, roleTitle }, null, 2),
    },
  });

  try {
    const exa = getExaClient();
    const maxAgeHours = 24 * 30;

    const queries: Array<{ category: string; query: string; numResults: number }> =
      [
        { category: "Official site", query: `${company} official website`, numResults: 4 },
        { category: "Careers", query: `${company} careers`, numResults: 4 },
        {
          category: "Recent news",
          query: `${company} latest news funding leadership launch`,
          numResults: 6,
        },
        {
          category: "Product / positioning",
          query: `${company} product customers pricing what does ${company} do`,
          numResults: 6,
        },
      ];

    const allResults = new Map<string, { category: string; result: ExaResult }>();

    for (const { category, query, numResults } of queries) {
      const response = await exa.search(query, {
        type: "auto",
        numResults,
        contents: { highlights: true, summary: true, maxAgeHours },
      });

      const results = (response.results ?? []) as unknown as ExaResult[];
      for (const result of results) {
        if (!result?.url) continue;
        allResults.set(result.url, { category, result });
      }
    }

    const persisted: Array<{ category: string; result: ExaResult }> = [];

    for (const item of allResults.values()) {
      const result = item.result;
      const publishedAt = toDate(result.publishedDate);

      await prisma.researchSource.upsert({
        where: {
          caseId_url: {
            caseId: applicationCase.id,
            url: result.url,
          },
        },
        update: {
          category: item.category,
          title: result.title ?? null,
          snippet: result.snippet ?? null,
          publishedAt,
          retrievedAt: new Date(),
          content: Array.isArray(result.highlights)
            ? result.highlights.join("\n\n")
            : result.summary ?? null,
        },
        create: {
          caseId: applicationCase.id,
          category: item.category,
          url: result.url,
          title: result.title ?? null,
          snippet: result.snippet ?? null,
          publishedAt,
          content: Array.isArray(result.highlights)
            ? result.highlights.join("\n\n")
            : result.summary ?? null,
        },
      });

      persisted.push(item);
    }

    const byCategory = new Map<string, ExaResult[]>();
    for (const { category, result } of persisted) {
      const bucket = byCategory.get(category) ?? [];
      bucket.push(result);
      byCategory.set(category, bucket);
    }

    const sections = Array.from(byCategory.entries()).map(([category, results]) =>
      markdownForCategory(category, results),
    );

    const previousVersion = applicationCase.artifacts[0]?.version ?? 0;
    const nextVersion = previousVersion + 1;

    const markdown = [
      `# Company Research Brief`,
      ``,
      `**Company**: ${company}`,
      `**Role**: ${roleTitle}`,
      `**Retrieved**: ${formatDate(new Date())}`,
      ``,
      `This brief is a source-backed capture of relevant company signals. It is not yet an LLM-synthesized narrative.`,
      ``,
      ...sections,
    ].join("\n");

    await prisma.$transaction([
      prisma.agentRun.update({
        where: { id: agentRun.id },
        data: { status: "completed", output: JSON.stringify({ sources: persisted.length }, null, 2) },
      }),
      prisma.artifact.create({
        data: {
          caseId: applicationCase.id,
          type: "company-research",
          title: `Company Research Brief (v${nextVersion})`,
          content: markdown,
          status: "draft",
          version: nextVersion,
        },
      }),
      prisma.caseTimelineEvent.create({
        data: {
          caseId: applicationCase.id,
          type: "company-research",
          title: "Company research saved",
          description: `Saved research brief version ${nextVersion} with ${persisted.length} sources.`,
        },
      }),
    ]);

    revalidatePath(`/cases/${applicationCase.id}`);
    revalidatePath(`/cases/${applicationCase.id}/research`);
    redirect(`/cases/${applicationCase.id}/research?saved=1`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await prisma.agentRun.update({
      where: { id: agentRun.id },
      data: { status: "failed", error: message },
    });
    revalidatePath(`/cases/${applicationCase.id}`);
    redirect(`/cases/${applicationCase.id}/research?error=research-failed`);
  }
}

