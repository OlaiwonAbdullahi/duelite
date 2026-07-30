import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import { isAdminAuthenticated } from "@/lib/admin-session"

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      phone: true,
      level: true,
      role: true,
      provisioned: true,
      provisionError: true,
      walletAddress: true,
      createdAt: true,
    },
  })

  return NextResponse.json({ users })
}
