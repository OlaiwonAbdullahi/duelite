import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth-helpers"

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const space = await prisma.space.findFirst({
    where: { repId: user.id },
    select: { id: true, name: true, joinCode: true },
  })

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      role: user.role,
      level: user.level,
      phone: user.phone,
      provisioned: user.provisioned,
      provisionError: user.provisionError,
      walletAddress: user.walletAddress,
    },
    managedSpace: space,
  })
}
