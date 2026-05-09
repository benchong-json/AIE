import OpenAI from "openai";

export function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  return new OpenAI({ apiKey });
}

export function getOpenAIModel() {
  return (process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini") as string;
}

