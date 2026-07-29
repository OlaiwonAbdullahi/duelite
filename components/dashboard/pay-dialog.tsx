"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Alert01Icon,
  CheckmarkCircle02Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { buttonVariants } from "@/components/ui/button"
import type { DuesItem } from "@/lib/dummy-data"
import { cn } from "@/lib/utils"

function PayDialog({
  item,
  spaceName,
  balance,
  onOpenChange,
  onConfirm,
}: {
  item: DuesItem | null
  spaceName: string | null
  balance: number
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}) {
  const [submitting, setSubmitting] = useState(false)

  const open = item !== null
  const insufficient = item ? balance < item.amount : false

  function handleConfirm() {
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      onConfirm()
    }, 700)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onOpenChange(false)
      }}
    >
      <DialogContent>
        {item && item.status === "PAID" ? (
          <div className="flex flex-col items-center gap-4 py-2 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-cloud">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={24} color="var(--primary)" />
            </div>
            <div>
              <h3 className="text-[16px] font-semibold text-ink">Payment sent</h3>
              <p className="mt-1 text-[14px] leading-[1.5] text-ink-soft">
                ₦{item.amount.toLocaleString()} to {spaceName} · {item.title}
              </p>
            </div>
            <div className="w-full rounded-md border border-hairline bg-canvas p-4 text-left">
              <p className="text-[12px] text-ink-soft">Transaction reference</p>
              <p className="mt-0.5 font-mono text-[13px] text-ink">{item.bmoniTxRef}</p>
              <div className="mt-3 flex items-center gap-1.5 text-[13px]">
                {item.verified ? (
                  <>
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} color="var(--primary)" />
                    <span className="font-medium text-primary">Verified on ledger</span>
                  </>
                ) : (
                  <>
                    <HugeiconsIcon icon={Loading03Icon} size={14} className="animate-spin text-ink-soft" />
                    <span className="text-ink-soft">Confirming on the BMONI ledger…</span>
                  </>
                )}
              </div>
            </div>
            <p className="text-[12px] leading-[1.4] text-ink-soft">
              Duey also sent this receipt to your WhatsApp.
            </p>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className={cn(buttonVariants({ variant: "secondary" }), "w-full")}
            >
              Done
            </button>
          </div>
        ) : (
          item && (
            <>
              <DialogHeader>
                <DialogTitle>Confirm payment</DialogTitle>
                <DialogDescription>
                  {item.title} · {spaceName}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-5 flex items-center justify-between rounded-md bg-cloud px-4 py-3">
                <span className="text-[14px] text-ink-soft">Amount</span>
                <span className="text-[20px] font-semibold text-ink">
                  ₦{item.amount.toLocaleString()}
                </span>
              </div>

              {insufficient ? (
                <div className="mt-4 flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-[13px] leading-[1.5] text-destructive">
                  <HugeiconsIcon icon={Alert01Icon} size={16} className="mt-0.5 shrink-0" />
                  <span>
                    Your wallet balance (₦{balance.toLocaleString()}) is below this amount.
                    Fund your account to continue.
                  </span>
                </div>
              ) : (
                <p className="mt-4 text-[13px] leading-[1.5] text-ink-soft">
                  This moves ₦{item.amount.toLocaleString()} cNGN from your wallet to{" "}
                  {spaceName}&apos;s wallet. Wallet balance: ₦{balance.toLocaleString()}.
                </p>
              )}

              <button
                type="button"
                disabled={insufficient || submitting}
                onClick={handleConfirm}
                className={cn(buttonVariants(), "mt-5 w-full")}
              >
                {submitting
                  ? "Sending payment…"
                  : insufficient
                    ? "Fund your account"
                    : `Pay ₦${item.amount.toLocaleString()}`}
              </button>
            </>
          )
        )}
      </DialogContent>
    </Dialog>
  )
}

export { PayDialog }
