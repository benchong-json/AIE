import { GoogleGenerativeAI } from "@google/generative-ai";
import { getOpenAIClient, getOpenAIModel } from "@/lib/openai";

export type LlmProvider = "openai" | "gemini";

export function getLlmProvider(): LlmProvider {
  const provider = (process.env.LLM_PROVIDER?.trim().toLowerCase() || "openai") as LlmProvider;
  return provider === "gemini" ? "gemini" : "openai";
}

export function assertLlmConfigured() {
  const provider = getLlmProvider();
  if (provider === "openai") {
    getOpenAIClient();
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
}

export async function generateJson(prompt: string): Promise<{ text: string; json: unknown }> {
  const provider = getLlmProvider();

  if (provider === "openai") {
    const client = getOpenAIClient();
    const model = getOpenAIModel();
    const completion = await client.chat.completions.create({
      model,
      temperature: 0.2,
      messages: [
        { role: "system", content: "Return JSON only." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });
    const text = completion.choices[0]?.message?.content ?? "";
    return { text, json: safeJsonParse(text) };
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const modelName = process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash";
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
    },
  });

  const result = await model.generateContent(prompt);
  const text = result.response.text() ?? "";
  return { text, json: safeJsonParse(text) };
}

function safeJsonParse(value: string) {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

