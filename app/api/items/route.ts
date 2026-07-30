import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth-helpers"

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const body = await request.json()
  const spaceId = String(body.spaceId ?? "")
  const title = String(body.title ?? "").trim()
  const amount = Number(body.amount)

  if (!spaceId || !title || !amount || amount <= 0) {
    return NextResponse.json({ error: "spaceId, title, and a positive amount are required" }, { status: 400 })
  }

  const space = await prisma.space.findUnique({ where: { id: spaceId } })
  if (!space || space.repId !== user.id) {
    return NextResponse.json({ error: "Space not found" }, { status: 404 })
  }

  const item = await prisma.paymentItem.create({
    data: { spaceId, title, amount: Math.round(amount) },
  })

  return NextResponse.json({ item: { id: item.id, title: item.title, amount: item.amount } })
}
