"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Alert01Icon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { buttonVariants } from "@/components/ui/button"
import type { DuesItem } from "@/lib/types"
import { cn } from "@/lib/utils"

export interface BatchPayItemResult {
  itemId: string
  ok: boolean
  error?: string
}

function BatchPayDialog({
  items,
  spaceName,
  balance,
  onOpenChange,
  onConfirm,
}: {
  items: DuesItem[] | null
  spaceName: string
  balance: number
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<{ ok: boolean; error?: string; results: BatchPayItemResult[] }>
}) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<BatchPayItemResult[] | null>(null)

  const open = items !== null && items.length > 0
  const total = items?.reduce((sum, i) => sum + i.amount, 0) ?? 0
  const insufficient = balance < total

  async function handleConfirm() {
    setSubmitting(true)
    setError(null)
    const result = await onConfirm()
    setSubmitting(false)
    if (result.results.length === 0) {
      setError(result.error ?? "Payment failed. Try again.")
      return
    }
    setResults(result.results)
  }

  function handleClose() {
    onOpenChange(false)
    setError(null)
    setResults(null)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) handleClose()
      }}
    >
      <DialogContent>
        {results ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col items-center gap-3 py-2 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-cloud">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={24} color="var(--primary)" />
              </div>
              <div>
                <h3 className="text-[16px] font-semibold text-ink">
                  {results.filter((r) => r.ok).length} of {results.length} paid
                </h3>
                <p className="mt-1 text-[14px] leading-[1.5] text-ink-soft">
                  {spaceName} · Duey sent receipts to your WhatsApp.
                </p>
              </div>
            </div>
            <div className="flex flex-col divide-y divide-hairline rounded-md border border-hairline">
              {results.map((r) => {
                const item = items?.find((i) => i.id === r.itemId)
                if (!item) return null
                return (
                  <div key={r.itemId} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div>
                      <p className="text-[13px] font-medium text-ink">{item.title}</p>
                      <p className="text-[12px] text-ink-soft">₦{item.amount.toLocaleString()}</p>
                    </div>
                    {r.ok ? (
                      <span className="flex items-center gap-1 text-[12px] font-medium text-primary">
                        <HugeiconsIcon icon={CheckmarkCircle02Icon} size={13} />
                        Paid
                      </span>
                    ) : (
                      <span
                        className="flex items-center gap-1 text-[12px] font-medium text-destructive"
                        title={r.error}
                      >
                        <HugeiconsIcon icon={Alert01Icon} size={13} />
                        Failed
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
            <button
              type="button"
              onClick={handleClose}
              className={cn(buttonVariants({ variant: "secondary" }), "w-full")}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Confirm payment</DialogTitle>
              <DialogDescription>
                {items?.length ?? 0} item{items && items.length > 1 ? "s" : ""} · {spaceName}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 flex flex-col divide-y divide-hairline rounded-md border border-hairline">
              {items?.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-4 py-2.5 text-[13px]"
                >
                  <span className="text-ink">{item.title}</span>
                  <span className="font-medium text-ink">₦{item.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between rounded-md bg-cloud px-4 py-3">
              <span className="text-[14px] text-ink-soft">Total</span>
              <span className="text-[20px] font-semibold text-ink">
                ₦{total.toLocaleString()}
              </span>
            </div>

            {insufficient ? (
              <div className="mt-4 flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-[13px] leading-[1.5] text-destructive">
                <HugeiconsIcon icon={Alert01Icon} size={16} className="mt-0.5 shrink-0" />
                <span>
                  Your wallet balance (₦{balance.toLocaleString()}) is below this total. Fund
                  your account or select fewer items.
                </span>
              </div>
            ) : (
              <p className="mt-4 text-[13px] leading-[1.5] text-ink-soft">
                This moves ₦{total.toLocaleString()} cNGN from your wallet to {spaceName}
                &apos;s wallet. Wallet balance: ₦{balance.toLocaleString()}.
              </p>
            )}

            {error && (
              <div className="mt-4 flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-[13px] leading-[1.5] text-destructive">
                <HugeiconsIcon icon={Alert01Icon} size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
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
                  : `Pay ₦${total.toLocaleString()}`}
            </button>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export { BatchPayDialog }
