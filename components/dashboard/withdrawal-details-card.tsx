"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { buttonVariants } from "@/components/ui/button"
import { apiFetch, ApiError } from "@/lib/api-client"
import { cn } from "@/lib/utils"

type Bank = { code: string; name: string }

function WithdrawalDetailsCard() {
  const [banks, setBanks] = useState<Bank[]>([])
  const [bankCode, setBankCode] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    apiFetch<{ banks: Array<Record<string, unknown>> }>("/api/payout/banks")
      .then(({ banks }) => setBanks(banks.flatMap((bank) => {
        const code = bank.code ?? bank.bankCode ?? bank.cbnCode
        const name = bank.name ?? bank.bankName
        return code && name ? [{ code: String(code), name: String(name) }] : []
      })))
      .catch(() => toast.error("Couldn't load the bank list"))
  }, [])

  async function saveDetails(event: React.FormEvent) {
    event.preventDefault()
    const bank = banks.find((item) => item.code === bankCode)
    if (!bank) return toast.error("Select a bank")
    setSaving(true)
    try {
      const result = await apiFetch<{ accountHolderName: string }>("/api/payout/account", {
        method: "POST",
        body: JSON.stringify({ accountNumber, bankCode: bank.code, bankName: bank.name }),
      })
      toast.success(`Verified account for ${result.accountHolderName}`)
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Couldn't save withdrawal details")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="max-w-sm p-5">
      <h3 className="text-[14px] font-semibold text-ink">Withdrawal details</h3>
      <p className="mt-1 text-[12px] leading-[1.5] text-ink-soft">Verify and save the Nigerian account that receives department payouts.</p>
      <form onSubmit={saveDetails} className="mt-4 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5"><Label htmlFor="withdrawal-bank">Bank</Label><Select id="withdrawal-bank" value={bankCode} onChange={(event) => setBankCode(event.target.value)} required><option value="" disabled>Select your bank</option>{banks.map((bank) => <option key={bank.code} value={bank.code}>{bank.name}</option>)}</Select></div>
        <div className="flex flex-col gap-1.5"><Label htmlFor="withdrawal-account">Account number</Label><Input id="withdrawal-account" value={accountNumber} onChange={(event) => setAccountNumber(event.target.value.replace(/\D/g, "").slice(0, 10))} inputMode="numeric" placeholder="0123456789" required /></div>
        <button type="submit" disabled={saving} className={cn(buttonVariants(), "w-full")}>{saving ? "Verifying..." : "Save withdrawal details"}</button>
      </form>
    </Card>
  )
}

export { WithdrawalDetailsCard }
