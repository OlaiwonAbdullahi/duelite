import { NextRequest, NextResponse } from "next/server"
import type { Hex } from "viem"

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth-helpers"
import { decryptSecret } from "@/lib/encryption"
import { verifyNigerianAccount, registerWithdrawalAccount, offrampNigeria } from "@/lib/bmoni"

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const space = await prisma.space.findFirst({ where: { repId: user.id } })
  if (!space) {
    return NextResponse.json({ error: "You don't manage a space yet" }, { status: 404 })
  }

  const body = await request.json()
  const accountNumber = String(body.accountNumber ?? "").trim()
  const bankCode = String(body.bankCode ?? "").trim()
  const bankName = String(body.bankName ?? "").trim()
  const amount = Number(body.amount)

  if (!accountNumber || !bankCode || !bankName || !amount || amount <= 0) {
    return NextResponse.json(
      { error: "accountNumber, bankCode, bankName, and a positive amount are required" },
      { status: 400 }
    )
  }

  try {
    const verification = await verifyNigerianAccount(space.bmoniUserId, { accountNumber, bankCode })
    const accountHolderName: string | undefined =
      verification?.accountName ?? verification?.data?.accountName ?? verification?.accountHolderName
    if (!accountHolderName) {
      return NextResponse.json({ error: "Couldn't verify that account — check the number and bank." }, { status: 400 })
    }

    const registration = await registerWithdrawalAccount(space.bmoniUserId, {
      accountNumber,
      bankCode,
      bankName,
      accountHolderName,
    })
    const bankAccountId: string | undefined = registration?.id ?? registration?.data?.id
    if (!bankAccountId) {
      return NextResponse.json({ error: "Couldn't register the withdrawal account" }, { status: 502 })
    }

    await prisma.space.update({
      where: { id: space.id },
      data: {
        withdrawalBankAccountId: bankAccountId,
        withdrawalBankCode: bankCode,
        withdrawalBankName: bankName,
        withdrawalAccountNumber: accountNumber,
        withdrawalAccountName: accountHolderName,
      },
    })

    const ownerPrivateKey = decryptSecret(space.ownerKeyEnc) as Hex
    const outcome = await offrampNigeria(space.bmoniUserId, space.walletId, {
      bankAccountId,
      fromAmount: amount.toFixed(2),
      ownerPrivateKey,
    })

    // A signature was submitted but we couldn't confirm the outcome in
    // time — the withdrawal is executing on BMONI's side regardless, so
    // this is NOT a failure. Don't let the rep think it's safe to retry.
    if (outcome.pending) {
      return NextResponse.json({
        reference: outcome.proposalId,
        accountHolderName,
        pending: true,
      })
    }

    const status = String(outcome.proposal?.proposal?.status ?? "")
    if (status !== "COMPLETED") {
      return NextResponse.json({ error: `Withdrawal didn't complete (status: ${status || "unknown"}).` }, { status: 502 })
    }

    return NextResponse.json({
      reference: String(
        outcome.proposal?.proposal?.blockchainTxHash ?? outcome.proposal?.proposal?.id ?? outcome.proposalId
      ),
      accountHolderName,
    })
  } catch (err) {
    console.error("payout failed:", err)
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: `Withdrawal failed: ${message}` }, { status: 502 })
  }
}
