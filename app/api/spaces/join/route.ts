import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth-helpers"

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const body = await request.json()
  const joinCode = String(body.joinCode ?? "").trim().toUpperCase()
  if (!joinCode) {
    return NextResponse.json({ error: "Join code is required" }, { status: 400 })
  }

  const space = await prisma.space.findUnique({
    where: { joinCode },
    include: { items: true },
  })
  if (!space) {
    return NextResponse.json({ error: "We couldn't find that space. Check the code and try again." }, { status: 404 })
  }

  try {
    await prisma.membership.create({ data: { userId: user.id, spaceId: space.id } })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json({ error: "You're already in this space." }, { status: 409 })
    }
    throw err
  }

  return NextResponse.json({
    space: {
      id: space.id,
      name: space.name,
      joinCode: space.joinCode,
      items: space.items.map((item) => ({
        id: item.id,
        title: item.title,
        amount: item.amount,
        status: "PENDING" as const,
        verified: false,
        flagged: false,
      })),
    },
  })
}
