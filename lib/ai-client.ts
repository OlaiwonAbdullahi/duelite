// Duey's LLM — routed through Hack Club's free OpenAI-compatible proxy
// (https://ai.hackclub.com), not a direct OpenAI account. AI_API_KEY and
// AI_MODEL are the only knobs; swap either via env without touching code.

import OpenAI from "openai"

export const AI_MODEL = process.env.AI_MODEL ?? "qwen/qwen3-32b"

export function getAiClient() {
  const apiKey = process.env.AI_API_KEY
  if (!apiKey) throw new Error("AI_API_KEY is not set")

  return new OpenAI({
    apiKey,
    baseURL: "https://ai.hackclub.com/proxy/v1",
  })
}
