"use client"

import { useEffect, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Alert01Icon, BankIcon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"

import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { buttonVariants } from "@/components/ui/button"
import { apiFetch, ApiError } from "@/lib/api-client"
import { cn } from "@/lib/utils"

interface Bank {
  code: string
  name: string
}

interface PayoutResult {
  reference: string
  accountHolderName: string
}

function normalizeBanks(raw: unknown[]): Bank[] {
  return raw
    .map((b) => {
      const bank = b as Record<string, unknown>
      const code = bank.code ?? bank.bankCode ?? bank.cbnCode
      const name = bank.name ?? bank.bankName
      return code && name ? { code: String(code), name: String(name) } : null
    })
    .filter((b): b is Bank => b !== null)
}

function PayoutCard({
  balance,
  onWithdrawn,
}: {
  balance: number
  onWithdrawn: () => void
}) {
  const [open, setOpen] = useState(false)
  const [stage, setStage] = useState<"form" | "success">("form")
  const [banks, setBanks] = useState<Bank[]>([])
  const [bankCode, setBankCode] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<PayoutResult | null>(null)

  useEffect(() => {
    if (!open || banks.length > 0) return
    apiFetch<{ banks: unknown[] }>("/api/payout/banks")
      .then((data) => setBanks(normalizeBanks(data.banks)))
      .catch(() => setBanks([]))
  }, [open, banks.length])

  function reset() {
    setStage("form")
    setError(null)
    setResult(null)
  }

  async function handleWithdraw(e: React.FormEvent) {
    e.preventDefault()
    const bank = banks.find((b) => b.code === bankCode)
    if (!bank) {
      setError("Select a bank")
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const data = await apiFetch<PayoutResult>("/api/payout", {
        method: "POST",
        body: JSON.stringify({
          accountNumber,
          bankCode: bank.code,
          bankName: bank.name,
          amount: balance,
        }),
      })
      setResult(data)
      setStage("success")
      onWithdrawn()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Withdrawal failed. Try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Card className="flex flex-col gap-4 p-5">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-full bg-cloud">
            <HugeiconsIcon icon={BankIcon} size={18} color="var(--primary)" />
          </div>
          <p className="text-[14px] font-semibold text-ink">Withdraw to bank</p>
        </div>

        <div className="rounded-md bg-cloud px-4 py-3">
          <p className="text-[12px] text-ink-soft">Withdrawable</p>
          <p className="mt-0.5 text-[22px] font-semibold text-ink">
            ₦{balance.toLocaleString()}
          </p>
        </div>

        <button
          type="button"
          disabled={balance <= 0}
          onClick={() => {
            reset()
            setOpen(true)
          }}
          className={cn(buttonVariants({ variant: "secondary" }), "w-full")}
        >
          Withdraw to bank
        </button>

        <p className="text-[12px] leading-[1.4] text-ink-soft">
          Sends cNGN off BMONI&apos;s rails as NGN to your Nigerian bank account.
        </p>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          {stage === "form" ? (
            <>
              <DialogHeader>
                <DialogTitle>Withdraw to bank</DialogTitle>
                <DialogDescription>
                  Sends cNGN off BMONI&apos;s rails as NGN to your registered account.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-5 flex items-center justify-between rounded-md bg-cloud px-4 py-3">
                <span className="text-[14px] text-ink-soft">Amount</span>
                <span className="text-[20px] font-semibold text-ink">
                  ₦{balance.toLocaleString()}
                </span>
              </div>

              <form onSubmit={handleWithdraw} className="mt-4 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="bankCode">Bank</Label>
                  <Select
                    id="bankCode"
                    value={bankCode}
                    onChange={(e) => setBankCode(e.target.value)}
                    required
                  >
                    <option value="" disabled>
                      {banks.length === 0 ? "Loading banks…" : "Select your bank"}
                    </option>
                    {banks.map((bank) => (
                      <option key={bank.code} value={bank.code}>
                        {bank.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="accountNumber">Account number</Label>
                  <Input
                    id="accountNumber"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="0123456789"
                    inputMode="numeric"
                    required
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-[13px] leading-[1.5] text-destructive">
                    <HugeiconsIcon icon={Alert01Icon} size={16} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className={cn(buttonVariants(), "mt-1 w-full")}
                >
                  {submitting ? "Processing…" : `Withdraw ₦${balance.toLocaleString()}`}
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 py-2 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-cloud">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={24} color="var(--primary)" />
              </div>
              <div>
                <h3 className="text-[16px] font-semibold text-ink">Withdrawal sent</h3>
                <p className="mt-1 text-[14px] leading-[1.5] text-ink-soft">
                  To {result?.accountHolderName}. Funds arrive within one business day.
                </p>
              </div>
              <div className="w-full rounded-md border border-hairline bg-canvas p-4 text-left">
                <p className="text-[12px] text-ink-soft">Offramp reference</p>
                <p className="mt-0.5 font-mono text-[13px] text-ink">{result?.reference}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className={cn(buttonVariants({ variant: "secondary" }), "w-full")}
              >
                Done
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export { PayoutCard }
