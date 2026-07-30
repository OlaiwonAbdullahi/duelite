import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth-helpers"
import { reconcileSpace } from "@/lib/reconcile"

export async function POST() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const [repSpaces, memberships] = await Promise.all([
    prisma.space.findMany({ where: { repId: user.id }, select: { id: true } }),
    prisma.membership.findMany({ where: { userId: user.id }, select: { spaceId: true } }),
  ])

  const spaceIds = new Set([...repSpaces.map((s) => s.id), ...memberships.map((m) => m.spaceId)])
  await Promise.all([...spaceIds].map((id) => reconcileSpace(id).catch(() => {})))

  return NextResponse.json({ ok: true })
}
