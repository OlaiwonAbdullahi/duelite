import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import { verifyPassword } from "@/lib/auth-helpers"
import { createSession } from "@/lib/session"
import { normalizeNigerianPhone } from "@/lib/identifiers"

export async function POST(request: NextRequest) {
  const body = await request.json()
  const rawPhone = String(body.phone ?? "").trim()
  const password = String(body.password ?? "")

  if (!rawPhone || !password) {
    return NextResponse.json({ error: "phone and password are required" }, { status: 400 })
  }

  const phone = normalizeNigerianPhone(rawPhone)
  const user = await prisma.user.findUnique({ where: { phone } })
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ error: "Invalid phone number or password" }, { status: 401 })
  }

  await createSession(user.id)

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      role: user.role,
      level: user.level,
      provisioned: user.provisioned,
    },
  })
}
