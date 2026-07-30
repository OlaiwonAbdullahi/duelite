"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { StatusPill } from "@/components/dashboard/status-pill"
import type { PayStatus } from "@/lib/types"

export interface TransactionDetail {
  title: string
  subtitle?: string
  amount: number
  txRef?: string
  time?: string
  status?: PayStatus
  verified?: boolean
  flagged?: boolean
}

function formatDate(iso?: string) {
  if (!iso) return null
  return new Date(iso).toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-hairline pb-3 last:border-0 last:pb-0">
      <span className="text-[13px] text-ink-soft">{label}</span>
      {children}
    </div>
  )
}

function TransactionDetailDialog({
  transaction,
  onOpenChange,
}: {
  transaction: TransactionDetail | null
  onOpenChange: (open: boolean) => void
}) {
  const open = transaction !== null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {transaction && (
          <>
            <DialogHeader>
              <DialogTitle>{transaction.title}</DialogTitle>
              {transaction.subtitle && <DialogDescription>{transaction.subtitle}</DialogDescription>}
            </DialogHeader>

            <div className="mt-5 flex items-center justify-between rounded-md bg-cloud px-4 py-3">
              <span className="text-[14px] text-ink-soft">Amount</span>
              <span className="text-[20px] font-semibold text-ink">
                ₦{transaction.amount.toLocaleString()}
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <Row label="Status">
                {transaction.status ? (
                  <StatusPill
                    status={transaction.status}
                    verified={transaction.verified ?? false}
                    flagged={transaction.flagged}
                  />
                ) : (
                  <span className="flex items-center gap-1.5 text-[13px] font-medium text-primary">
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} color="var(--primary)" />
                    Verified on ledger
                  </span>
                )}
              </Row>
              {transaction.time && (
                <Row label="Date">
                  <span className="text-[13px] text-ink">{formatDate(transaction.time)}</span>
                </Row>
              )}
              {transaction.txRef && (
                <Row label="Ledger reference">
                  <span className="font-mono text-[13px] text-ink">{transaction.txRef}</span>
                </Row>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export { TransactionDetailDialog }
