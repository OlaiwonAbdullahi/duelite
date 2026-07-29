"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkCircle02Icon, Loading03Icon, Wallet01Icon } from "@hugeicons/core-free-icons"

import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/dashboard/empty-state"
import {
  TransactionDetailDialog,
  type TransactionDetail,
} from "@/components/dashboard/transaction-detail-dialog"
import { useDashboard } from "@/components/dashboard/dashboard-context"
import { recentLedgerActivity } from "@/lib/dummy-data"

function TransactionPage() {
  const { role, spaces } = useDashboard()
  const isRep = role === "REP"
  const [selected, setSelected] = useState<TransactionDetail | null>(null)

  const transactions = spaces
    .flatMap((s) => s.items.filter((i) => i.status === "PAID").map((i) => ({ ...i, spaceName: s.name })))
    .sort((a, b) => (b.paidAt ?? "").localeCompare(a.paidAt ?? ""))

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-[24px] font-semibold text-ink">Transactions</h1>
        <p className="mt-1 text-[14px] text-ink-soft">
          Every payment you&apos;ve made, pulled from BMONI&apos;s ledger.
        </p>

        <div className="mt-5">
          {transactions.length === 0 ? (
            <EmptyState
              icon={Wallet01Icon}
              title="No transactions yet"
              description="Payments you make will show up here with their ledger reference."
            />
          ) : (
            <Card className="flex flex-col divide-y divide-hairline p-0">
              {transactions.map((tx) => (
                <button
                  key={tx.id}
                  type="button"
                  onClick={() =>
                    setSelected({
                      title: tx.title,
                      subtitle: tx.spaceName,
                      amount: tx.amount,
                      txRef: tx.bmoniTxRef,
                      time: tx.paidAt,
                      status: tx.status,
                      verified: tx.verified,
                      flagged: tx.flagged,
                    })
                  }
                  className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors duration-300 hover:bg-cloud/50 cursor-pointer"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-medium text-ink">{tx.title}</p>
                    <p className="text-[12px] text-ink-soft">{tx.spaceName}</p>
                    <p className="mt-1 font-mono text-[11px] text-ink-soft">{tx.bmoniTxRef}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-[14px] font-semibold text-ink">
                      ₦{tx.amount.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1 text-[12px]">
                      {tx.verified ? (
                        <>
                          <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} color="var(--primary)" />
                          <span className="text-primary">Verified</span>
                        </>
                      ) : (
                        <>
                          <HugeiconsIcon
                            icon={Loading03Icon}
                            size={12}
                            className="animate-spin text-ink-soft"
                          />
                          <span className="text-ink-soft">Confirming</span>
                        </>
                      )}
                    </span>
                  </div>
                </button>
              ))}
            </Card>
          )}
        </div>
      </div>

      {isRep && (
        <div>
          <h2 className="text-[16px] font-semibold text-ink">Incoming to your space</h2>
          <p className="mt-1 text-[13px] text-ink-soft">
            Recent ledger activity from your department&apos;s members.
          </p>
          <Card className="mt-4 flex flex-col divide-y divide-hairline p-0">
            {recentLedgerActivity.map((tx) => (
              <button
                key={tx.id}
                type="button"
                onClick={() =>
                  setSelected({
                    title: tx.label,
                    amount: tx.amount,
                    txRef: tx.txRef,
                    time: tx.time,
                  })
                }
                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors duration-300 hover:bg-cloud/50 cursor-pointer"
              >
                <div className="min-w-0">
                  <p className="truncate text-[14px] text-ink">{tx.label}</p>
                  <p className="font-mono text-[12px] text-ink-soft">{tx.txRef}</p>
                </div>
                <span className="shrink-0 text-[14px] font-semibold text-ink">
                  ₦{tx.amount.toLocaleString()}
                </span>
              </button>
            ))}
          </Card>
        </div>
      )}

      <TransactionDetailDialog
        transaction={selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null)
        }}
      />
    </div>
  )
}

export default TransactionPage
