import type { User, DueyChannel } from "@prisma/client"
import type OpenAI from "openai"
import type { ChatCompletionMessageParam, ChatCompletionMessageToolCall } from "openai/resources/chat/completions"

import { prisma } from "@/lib/prisma"
import { getAiClient, AI_MODEL } from "@/lib/ai-client"
import { buildDueySystemPrompt } from "@/lib/duey/prompt"
import { DUEY_TOOLS, executeDueyTool } from "@/lib/duey/tools"

const HISTORY_LIMIT = 30
const MAX_TOOL_ROUNDS = 5

async function loadHistory(userId: string, channel: DueyChannel): Promise<ChatCompletionMessageParam[]> {
  const rows = await prisma.dueyMessage.findMany({
    where: { userId, channel },
    orderBy: { createdAt: "desc" },
    take: HISTORY_LIMIT,
  })
  rows.reverse()

  return rows.map((row): ChatCompletionMessageParam => {
    if (row.role === "USER") {
      return { role: "user", content: row.content ?? "" }
    }
    if (row.role === "TOOL") {
      return { role: "tool", tool_call_id: row.toolCallId ?? "", content: row.content ?? "" }
    }
    // ASSISTANT
    const toolCalls: ChatCompletionMessageToolCall[] | undefined = row.toolCalls
      ? JSON.parse(row.toolCalls)
      : undefined
    return {
      role: "assistant",
      content: row.content ?? (toolCalls ? null : ""),
      ...(toolCalls ? { tool_calls: toolCalls } : {}),
    }
  })
}

async function persist(
  userId: string,
  channel: DueyChannel,
  message: { role: "USER" | "ASSISTANT" | "TOOL"; content?: string | null; toolCalls?: unknown; toolCallId?: string }
) {
  await prisma.dueyMessage.create({
    data: {
      userId,
      channel,
      role: message.role,
      content: message.content ?? null,
      toolCalls: message.toolCalls ? JSON.stringify(message.toolCalls) : null,
      toolCallId: message.toolCallId ?? null,
    },
  })
}

export async function runDuey(params: {
  user: User
  channel: DueyChannel
  incomingMessage: string
}): Promise<{ reply: string }> {
  const { user, channel, incomingMessage } = params

  const history = await loadHistory(user.id, channel)
  await persist(user.id, channel, { role: "USER", content: incomingMessage })

  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: buildDueySystemPrompt(user, channel) },
    ...history,
    { role: "user", content: incomingMessage },
  ]

  const client: OpenAI = getAiClient()

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const completion = await client.chat.completions.create({
      model: AI_MODEL,
      messages,
      tools: DUEY_TOOLS,
    })

    const choice = completion.choices[0]?.message
    if (!choice) {
      return { reply: "Sorry, I didn't get that — can you try again?" }
    }

    if (!choice.tool_calls || choice.tool_calls.length === 0) {
      const reply = choice.content?.trim() || "Sorry, I didn't get that — can you try again?"
      await persist(user.id, channel, { role: "ASSISTANT", content: reply })
      return { reply }
    }

    // Some models (this proxy's qwen among them) leak a stray fragment of
    // their tool-call formatting into `content` alongside a real tool call —
    // never meaningful prose, so it's dropped rather than replayed to the
    // model or shown to the user later.
    messages.push({ role: "assistant", content: null, tool_calls: choice.tool_calls })
    await persist(user.id, channel, {
      role: "ASSISTANT",
      content: null,
      toolCalls: choice.tool_calls,
    })

    for (const toolCall of choice.tool_calls) {
      if (toolCall.type !== "function") continue
      const result = await executeDueyTool(toolCall.function.name, toolCall.function.arguments, user)
      const content = JSON.stringify(result)
      messages.push({ role: "tool", tool_call_id: toolCall.id, content })
      await persist(user.id, channel, { role: "TOOL", content, toolCallId: toolCall.id })
    }
  }

  const fallback = "That took more steps than I've got patience for right now — try asking again in a moment."
  await persist(user.id, channel, { role: "ASSISTANT", content: fallback })
  return { reply: fallback }
}
