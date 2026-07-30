import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth-helpers"
import { listNigerianBanks } from "@/lib/bmoni"

function extractBanks(value: unknown): unknown[] {
  if (Array.isArray(value)) return value
  if (!value || typeof value !== "object") return []

  const record = value as Record<string, unknown>
  for (const key of ["banks", "nigerianBanks", "items", "data", "results"]) {
    const banks = extractBanks(record[key])
    if (banks.length > 0) return banks
  }
  return []
}

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const space = await prisma.space.findFirst({ where: { repId: user.id } })
  if (!space) {
    return NextResponse.json({ error: "You don't manage a space yet" }, { status: 404 })
  }

  try {
    const response = await listNigerianBanks(space.bmoniUserId)
    const banks = extractBanks(response)
    if (banks.length === 0) {
      console.error("listNigerianBanks returned no bank records:", response)
      return NextResponse.json({ error: "BMONI returned no supported Nigerian banks" }, { status: 502 })
    }
    return NextResponse.json({ banks })
  } catch (err) {
    console.error("listNigerianBanks failed:", err)
    return NextResponse.json({ error: "Couldn't load the bank list" }, { status: 502 })
  }
}
