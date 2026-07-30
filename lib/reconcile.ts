import { prisma } from "@/lib/prisma"
import { getTransactions } from "@/lib/bmoni"

// Best-effort ledger reconciliation (details.md §5.5) — matches PAID-but-
// unverified payments against the space wallet's transaction list. The
// exact response shape of getTransactions() hasn't been exercised live yet,
// so this tries a few common envelopes and silently no-ops on failure
// rather than breaking dashboard loads.
export async function reconcileSpace(spaceId: string) {
  const unverified = await prisma.payment.findMany({
    where: { status: "PAID", verified: false, item: { spaceId } },
  })
  if (unverified.length === 0) return

  const space = await prisma.space.findUnique({ where: { id: spaceId } })
  if (!space) return

  let txRefs: Set<string>
  try {
    const response = await getTransactions(space.bmoniUserId)
    const list: Record<string, unknown>[] =
      response?.transactions ?? response?.data ?? (Array.isArray(response) ? response : [])
    txRefs = new Set(
      list
        .map((tx) => tx?.id ?? tx?.transactionId ?? tx?.proposalId ?? tx?.txHash)
        .filter((ref): ref is string | number => ref != null)
        .map(String)
    )
  } catch (err) {
    console.error("reconcileSpace: getTransactions failed", err)
    return
  }

  for (const payment of unverified) {
    if (payment.bmoniTxRef && txRefs.has(payment.bmoniTxRef)) {
      await prisma.payment.update({ where: { id: payment.id }, data: { verified: true } })
    }
  }
}
