import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth-helpers"
import { runDuey } from "@/lib/duey/run"

// Chat history for the web widget — only the visible user/assistant turns
// (tool calls and their results are internal plumbing, not shown to the user).
export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const rows = await prisma.dueyMessage.findMany({
    where: {
      userId: user.id,
      channel: "WEB",
      role: { in: ["USER", "ASSISTANT"] },
      toolCalls: null,
      NOT: { content: null },
    },
    orderBy: { createdAt: "asc" },
    take: 100,
  })

  return NextResponse.json({
    messages: rows.map((row: { role: "USER" | "ASSISTANT"; content: string | null }) => ({
      role: row.role === "USER" ? "user" : "assistant",
      content: row.content,
    })),
  })
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const body = await request.json()
  const message = String(body.message ?? "").trim()
  if (!message) {
    return NextResponse.json({ error: "message is required" }, { status: 400 })
  }

  try {
    const { reply } = await runDuey({ user, channel: "WEB", incomingMessage: message })
    return NextResponse.json({ reply })
  } catch (err) {
    console.error("duey: runDuey failed", err)
    return NextResponse.json({ error: "Duey's having trouble right now — try again in a moment." }, { status: 502 })
  }
}
