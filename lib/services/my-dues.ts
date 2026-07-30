import type { User } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import { getBalances, extractNgnBalance } from "@/lib/bmoni"
import { reconcileSpace } from "@/lib/reconcile"
import type { StudentSpace } from "@/lib/types"

export interface MyDuesData {
  balance: number
  walletAddress: string | null
  spaces: StudentSpace[]
}

export async function getMyDuesData(user: User): Promise<MyDuesData> {
  const memberships = await prisma.membership.findMany({
    where: { userId: user.id },
    include: {
      space: {
        include: {
          items: {
            include: { payments: { where: { userId: user.id }, orderBy: { createdAt: "desc" } } },
          },
        },
      },
    },
  })

  await Promise.all(memberships.map((m) => reconcileSpace(m.space.id).catch(() => {})))

  const spaces: StudentSpace[] = memberships.map(({ space }) => ({
    id: space.id,
    name: space.name,
    joinCode: space.joinCode,
    items: space.items.map((item) => {
      // Prefer the latest PAID payment for display; fall back to the most
      // recent attempt (FAILED/PENDING) if there's no successful one yet.
      const paid = item.payments.find((p) => p.status === "PAID")
      const latest = paid ?? item.payments[0] ?? null
      return {
        id: item.id,
        title: item.title,
        amount: item.amount,
        status: latest?.status ?? "PENDING",
        verified: latest?.verified ?? false,
        flagged: latest?.flagged ?? false,
        bmoniTxRef: latest?.bmoniTxRef ?? undefined,
        paidAt: latest?.status === "PAID" ? latest.createdAt.toISOString() : undefined,
      }
    }),
  }))

  let balance = 0
  if (user.provisioned && user.bmoniUserId) {
    try {
      balance = extractNgnBalance(await getBalances(user.bmoniUserId))
    } catch (err) {
      console.error("getMyDuesData: getBalances failed", err)
    }
  }

  return { balance, walletAddress: user.walletAddress, spaces }
}
