import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth-helpers"
import { registerWithdrawalAccount, verifyNigerianAccount } from "@/lib/bmoni"

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const space = await prisma.space.findFirst({ where: { repId: user.id } })
  if (!space) return NextResponse.json({ error: "You don't manage a space yet" }, { status: 404 })

  const body = await request.json()
  const accountNumber = String(body.accountNumber ?? "").trim()
  const bankCode = String(body.bankCode ?? "").trim()
  const bankName = String(body.bankName ?? "").trim()
  if (!/^\d{10}$/.test(accountNumber) || !bankCode || !bankName) {
    return NextResponse.json({ error: "Enter a 10-digit account number and select a bank" }, { status: 400 })
  }

  try {
    const verified = await verifyNigerianAccount(space.bmoniUserId, { accountNumber, bankCode })
    const accountHolderName = verified?.accountName ?? verified?.data?.accountName ?? verified?.accountHolderName
    if (!accountHolderName) return NextResponse.json({ error: "We couldn't verify that account. Check the number and bank." }, { status: 400 })

    const registered = await registerWithdrawalAccount(space.bmoniUserId, { accountNumber, bankCode, bankName, accountHolderName })
    const bankAccountId = registered?.id ?? registered?.data?.id
    if (!bankAccountId) return NextResponse.json({ error: "Couldn't register the withdrawal account" }, { status: 502 })

    await prisma.space.update({
      where: { id: space.id },
      data: {
        withdrawalBankAccountId: String(bankAccountId),
        withdrawalBankCode: bankCode,
        withdrawalBankName: bankName,
        withdrawalAccountNumber: accountNumber,
        withdrawalAccountName: String(accountHolderName),
      },
    })

    return NextResponse.json({ accountHolderName: String(accountHolderName) })
  } catch (error) {
    console.error("register withdrawal account failed:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Couldn't save withdrawal details" }, { status: 502 })
  }
}
