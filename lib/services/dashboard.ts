import type { User } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import { getBalances, extractNgnBalance } from "@/lib/bmoni"
import { reconcileSpace } from "@/lib/reconcile"
import type { ManagedSpace, RepItem, MemberRow, AnomalyAlert } from "@/lib/types"

export interface DashboardData {
  space: ManagedSpace
  items: RepItem[]
  members: MemberRow[]
  totals: { totalExpected: number; totalCollected: number; verifiedCount: number; memberCount: number }
  repBalance: number
  anomalies: AnomalyAlert[]
}

export class NoManagedSpaceError extends Error {
  constructor() {
    super("You don't manage a space yet")
    this.name = "NoManagedSpaceError"
  }
}

export async function getDashboardData(user: User): Promise<DashboardData> {
  const space = await prisma.space.findFirst({
    where: { repId: user.id },
    include: {
      items: true,
      memberships: {
        include: { user: { select: { id: true, name: true, phone: true, level: true } } },
      },
    },
  })

  if (!space) {
    throw new NoManagedSpaceError()
  }

  await reconcileSpace(space.id).catch(() => {})

  const payments = await prisma.payment.findMany({
    where: { item: { spaceId: space.id } },
    orderBy: { createdAt: "desc" },
  })

  // Latest payment per (userId, itemId) — prefers a PAID one for display,
  // mirroring the same rule getMyDuesData uses.
  const latestByMember = new Map<string, (typeof payments)[number]>()
  for (const payment of payments) {
    const key = `${payment.userId}:${payment.itemId}`
    const existing = latestByMember.get(key)
    if (!existing || (payment.status === "PAID" && existing.status !== "PAID")) {
      latestByMember.set(key, payment)
    }
  }

  const members: MemberRow[] = space.memberships.map(({ user: member }) => {
    const memberPayments: MemberRow["payments"] = {}
    for (const item of space.items) {
      const payment = latestByMember.get(`${member.id}:${item.id}`)
      memberPayments[item.id] = {
        status: payment?.status ?? "PENDING",
        verified: payment?.verified ?? false,
        flagged: payment?.flagged ?? false,
        bmoniTxRef: payment?.bmoniTxRef ?? undefined,
        paidAt: payment?.status === "PAID" ? payment.createdAt.toISOString() : undefined,
      }
    }
    return {
      id: member.id,
      name: member.name,
      phone: member.phone,
      level: member.level ?? "",
      payments: memberPayments,
    }
  })

  const totalExpected = members.length * space.items.reduce((sum, i) => sum + i.amount, 0)
  const totalCollected = payments.filter((p) => p.status === "PAID").reduce((sum, p) => sum + p.amount, 0)
  const verifiedCount = payments.filter((p) => p.status === "PAID" && p.verified).length

  const anomalies: AnomalyAlert[] = payments
    .filter((p) => p.flagged)
    .map((p) => {
      const member = space.memberships.find((m) => m.userId === p.userId)?.user
      const item = space.items.find((i) => i.id === p.itemId)
      return {
        id: p.id,
        memberName: member?.name ?? "Unknown",
        itemTitle: item?.title ?? "Unknown item",
        reason: p.flagReason ?? "Flagged for review",
        createdAt: p.createdAt.toISOString(),
      }
    })

  let repBalance = 0
  try {
    repBalance = extractNgnBalance(await getBalances(space.bmoniUserId))
  } catch (err) {
    console.error("getDashboardData: getBalances failed", err)
  }

  return {
    space: { id: space.id, name: space.name, joinCode: space.joinCode, walletAddress: space.walletAddress },
    items: space.items.map((i) => ({ id: i.id, title: i.title, amount: i.amount })),
    members,
    totals: { totalExpected, totalCollected, verifiedCount, memberCount: members.length },
    repBalance,
    anomalies,
  }
}
