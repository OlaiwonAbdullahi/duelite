import type { User, Payment } from "@prisma/client"
import type { Hex } from "viem"

import { prisma } from "@/lib/prisma"
import { decryptSecret } from "@/lib/encryption"
import { getBalances, extractNgnBalance, transferCngn } from "@/lib/bmoni"

export type PayDueResult =
  | { ok: true; payment: Payment }
  | { ok: false; status: number; error: string; payment?: Payment }

interface PayableItem {
  id: string
  title: string
  spaceId: string
  spaceName: string
  spaceWalletAddress: string
  amount: number
}

type LoadPayableItemResult =
  | { ok: true; item: PayableItem; balance: number }
  | { ok: false; status: number; error: string }

// Shared validation for both previewDue() and payDue(): account provisioned,
// item exists, user is a member of its space, and their wallet balance is
// enough to cover it. Stops short of moving any money.
async function loadPayableItem(user: User, itemId: string): Promise<LoadPayableItemResult> {
  // details.md §5.4: block here if provisioning hasn't finished yet.
  if (!user.provisioned || !user.bmoniUserId || !user.walletId || !user.ownerKeyEnc) {
    return { ok: false, status: 409, error: "Your account is still being set up. Try again in a moment." }
  }

  const item = await prisma.paymentItem.findUnique({
    where: { id: itemId },
    include: { space: true },
  })
  if (!item) {
    return { ok: false, status: 404, error: "Payment item not found" }
  }

  const membership = await prisma.membership.findUnique({
    where: { userId_spaceId: { userId: user.id, spaceId: item.spaceId } },
  })
  if (!membership) {
    return { ok: false, status: 403, error: "Join this space before paying" }
  }

  let balance: number
  try {
    const balances = await getBalances(user.bmoniUserId)
    balance = extractNgnBalance(balances)
  } catch (err) {
    console.error("loadPayableItem: getBalances failed", err)
    return { ok: false, status: 502, error: "Couldn't read your wallet balance right now" }
  }

  if (balance < item.amount) {
    return {
      ok: false,
      status: 402,
      error: `Insufficient balance. You have ₦${balance.toLocaleString()}, this item is ₦${item.amount.toLocaleString()}.`,
    }
  }

  return {
    ok: true,
    balance,
    item: {
      id: item.id,
      title: item.title,
      spaceId: item.spaceId,
      spaceName: item.space.name,
      spaceWalletAddress: item.space.walletAddress,
      amount: item.amount,
    },
  }
}

export interface PreviewDueResult {
  ok: boolean
  status: number
  error?: string
  itemId?: string
  title?: string
  spaceName?: string
  amount?: number
  balance?: number
}

// Read-only: describes what paying this item would do, without touching
// funds. Used by Duey to show a preview before asking the user to confirm.
export async function previewDue(user: User, itemId: string): Promise<PreviewDueResult> {
  const loaded = await loadPayableItem(user, itemId)
  if (!loaded.ok) {
    return { ok: false, status: loaded.status, error: loaded.error }
  }
  return {
    ok: true,
    status: 200,
    itemId: loaded.item.id,
    title: loaded.item.title,
    spaceName: loaded.item.spaceName,
    amount: loaded.item.amount,
    balance: loaded.balance,
  }
}

export async function payDue(user: User, itemId: string): Promise<PayDueResult> {
  const loaded = await loadPayableItem(user, itemId)
  if (!loaded.ok) {
    return { ok: false, status: loaded.status, error: loaded.error }
  }
  const { item } = loaded

  // Anomaly watch (details.md §8): flag rather than block a duplicate.
  const priorPaid = await prisma.payment.findFirst({
    where: { userId: user.id, itemId, status: "PAID" },
  })

  const payment = await prisma.payment.create({
    data: {
      userId: user.id,
      itemId,
      amount: item.amount,
      status: "PENDING",
      flagged: Boolean(priorPaid),
      flagReason: priorPaid ? "Duplicate payment — this item was already paid by this student." : null,
    },
  })

  try {
    const ownerPrivateKey = decryptSecret(user.ownerKeyEnc!) as Hex
    const result = await transferCngn({
      userId: user.bmoniUserId!,
      smartWalletId: user.walletId!,
      toAddress: item.spaceWalletAddress,
      amount: String(item.amount),
      ownerPrivateKey,
    })

    const status = String(result?.data?.status ?? result?.status ?? "")
    const txRef = String(result?.data?.proposalId ?? result?.proposalId ?? payment.id)

    if (status !== "COMPLETED") {
      const failed = await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED", bmoniTxRef: txRef },
      })
      return {
        ok: false,
        status: 502,
        error: `Transfer didn't complete (status: ${status || "unknown"}).`,
        payment: failed,
      }
    }

    const paid = await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "PAID", bmoniTxRef: txRef },
    })

    return { ok: true, payment: paid }
  } catch (err) {
    console.error("payDue: transferCngn failed:", err)
    const message = err instanceof Error ? err.message : String(err)
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } })
    return { ok: false, status: 502, error: `Payment failed: ${message}` }
  }
}
