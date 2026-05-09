import Exa from "exa-js";

export function getExaClient() {
  const apiKey = process.env.EXA_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("EXA_API_KEY is not configured");
  }

  return new Exa(apiKey);
}

