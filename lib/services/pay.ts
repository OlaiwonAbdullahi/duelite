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

export interface PayDuesResult {
  ok: boolean
  status: number
  error?: string
  payments: Payment[]
  failed: { itemId: string; error: string }[]
}

// Pays several items in one go. Validates membership on every item and
// checks the combined total against the live balance up front — so the
// student isn't left with 2 of 3 items paid because the 3rd couldn't be
// covered — then executes each transfer through payDue() sequentially,
// since balance genuinely drops after each transfer completes.
export async function payDues(user: User, itemIds: string[]): Promise<PayDuesResult> {
  if (itemIds.length === 0) {
    return { ok: false, status: 400, error: "No items selected", payments: [], failed: [] }
  }

  if (!user.provisioned || !user.bmoniUserId || !user.walletId || !user.ownerKeyEnc) {
    return {
      ok: false,
      status: 409,
      error: "Your account is still being set up. Try again in a moment.",
      payments: [],
      failed: [],
    }
  }

  const items = await prisma.paymentItem.findMany({
    where: { id: { in: itemIds } },
    include: { space: true },
  })
  if (items.length !== itemIds.length) {
    return { ok: false, status: 404, error: "One or more payment items were not found", payments: [], failed: [] }
  }

  const memberships = await prisma.membership.findMany({
    where: { userId: user.id, spaceId: { in: items.map((i) => i.spaceId) } },
  })
  const memberSpaceIds = new Set(memberships.map((m) => m.spaceId))
  const notMember = items.find((i) => !memberSpaceIds.has(i.spaceId))
  if (notMember) {
    return {
      ok: false,
      status: 403,
      error: `Join ${notMember.space.name} before paying its dues`,
      payments: [],
      failed: [],
    }
  }

  const total = items.reduce((sum, i) => sum + i.amount, 0)

  let balance: number
  try {
    const balances = await getBalances(user.bmoniUserId)
    balance = extractNgnBalance(balances)
  } catch (err) {
    console.error("payDues: getBalances failed", err)
    return { ok: false, status: 502, error: "Couldn't read your wallet balance right now", payments: [], failed: [] }
  }

  if (balance < total) {
    return {
      ok: false,
      status: 402,
      error: `Insufficient balance. You have ₦${balance.toLocaleString()}, these ${items.length} items total ₦${total.toLocaleString()}.`,
      payments: [],
      failed: [],
    }
  }

  const payments: Payment[] = []
  const failed: { itemId: string; error: string }[] = []

  for (const item of items) {
    const result = await payDue(user, item.id)
    if (result.ok) {
      payments.push(result.payment)
    } else {
      failed.push({ itemId: item.id, error: result.error })
    }
  }

  return { ok: failed.length === 0, status: failed.length === 0 ? 200 : 207, payments, failed }
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
    const outcome = await transferCngn({
      userId: user.bmoniUserId!,
      smartWalletId: user.walletId!,
      toAddress: item.spaceWalletAddress,
      amount: String(item.amount),
      ownerPrivateKey,
    })

    // A signature was submitted but we couldn't confirm completion in
    // time — the transfer is executing on BMONI's side regardless, so this
    // is NOT a failure. Leave the payment PENDING (never FAILED here) so
    // the student isn't told to retry a transfer that may already be
    // moving their money; /api/reconcile picks these up once BMONI's
    // ledger reflects the completed transfer.
    if (outcome.pending) {
      await prisma.payment.update({ where: { id: payment.id }, data: { bmoniTxRef: outcome.proposalId } })
      return {
        ok: false,
        status: 202,
        error: "Payment submitted and is confirming on the ledger. Check back in a moment before retrying.",
        payment,
      }
    }

    const status = String(outcome.proposal?.proposal?.status ?? "")
    const txRef = String(
      outcome.proposal?.proposal?.blockchainTxHash ?? outcome.proposal?.proposal?.id ?? outcome.proposalId
    )

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
    // Only reachable for failures *before* a signature was ever submitted
    // (create proposal / approve / fetch sign-payload / sign itself) —
    // nothing was executed on BMONI's side, so FAILED is accurate here.
    console.error("payDue: transfer failed before signing:", err)
    const message = err instanceof Error ? err.message : String(err)
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } })
    return { ok: false, status: 502, error: `Payment failed: ${message}` }
  }
}
