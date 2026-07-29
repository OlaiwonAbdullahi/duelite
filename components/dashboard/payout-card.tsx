"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { BankIcon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"

import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { buttonVariants } from "@/components/ui/button"
import { payoutInfo } from "@/lib/dummy-data"
import { fakeTxRef } from "@/lib/utils"
import { cn } from "@/lib/utils"

function PayoutCard({
  balance,
  onWithdrawn,
}: {
  balance: number
  onWithdrawn: () => void
}) {
  const [open, setOpen] = useState(false)
  const [stage, setStage] = useState<"confirm" | "success">("confirm")
  const [submitting, setSubmitting] = useState(false)
  const [reference, setReference] = useState("")

  function handleWithdraw() {
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setReference(`OFR-${fakeTxRef().slice(2, 8).toUpperCase()}`)
      setStage("success")
      onWithdrawn()
    }, 900)
  }

  return (
    <>
      <Card className="flex flex-col gap-4 p-5">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-full bg-cloud">
            <HugeiconsIcon icon={BankIcon} size={18} color="var(--primary)" />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-ink">{payoutInfo.bankName}</p>
            <p className="text-[12px] text-ink-soft">
              {payoutInfo.accountNumber} · {payoutInfo.accountName}
            </p>
          </div>
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
            setStage("confirm")
            setOpen(true)
          }}
          className={cn(buttonVariants({ variant: "secondary" }), "w-full")}
        >
          Withdraw to bank
        </button>

        <p className="text-[12px] leading-[1.4] text-ink-soft">
          Last withdrawal: ₦{payoutInfo.lastWithdrawal.amount.toLocaleString()} ·{" "}
          {payoutInfo.lastWithdrawal.reference}
        </p>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          {stage === "confirm" ? (
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
              <p className="mt-3 text-[13px] leading-[1.5] text-ink-soft">
                To {payoutInfo.bankName} {payoutInfo.accountNumber} ({payoutInfo.accountName}).
              </p>
              <button
                type="button"
                disabled={submitting}
                onClick={handleWithdraw}
                className={cn(buttonVariants(), "mt-5 w-full")}
              >
                {submitting ? "Processing…" : `Withdraw ₦${balance.toLocaleString()}`}
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 py-2 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-cloud">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={24} color="var(--primary)" />
              </div>
              <div>
                <h3 className="text-[16px] font-semibold text-ink">Withdrawal sent</h3>
                <p className="mt-1 text-[14px] leading-[1.5] text-ink-soft">
                  Funds arrive within one business day.
                </p>
              </div>
              <div className="w-full rounded-md border border-hairline bg-canvas p-4 text-left">
                <p className="text-[12px] text-ink-soft">Offramp reference</p>
                <p className="mt-0.5 font-mono text-[13px] text-ink">{reference}</p>
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
