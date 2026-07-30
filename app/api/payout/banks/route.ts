import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth-helpers"
import { listNigerianBanks } from "@/lib/bmoni"

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
    const banks = response?.banks ?? response?.data ?? (Array.isArray(response) ? response : [])
    return NextResponse.json({ banks })
  } catch (err) {
    console.error("listNigerianBanks failed:", err)
    return NextResponse.json({ error: "Couldn't load the bank list" }, { status: 502 })
  }
}
