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
import type { MemberRow, RepItem } from "@/lib/types"

function DueDetailDialog({
  due,
  members,
  onOpenChange,
}: {
  due: RepItem | null
  members: MemberRow[]
  onOpenChange: (open: boolean) => void
}) {
  const open = due !== null
  const paid = due ? members.filter((m) => m.payments[due.id]?.status === "PAID") : []
  const notPaid = due ? members.filter((m) => m.payments[due.id]?.status !== "PAID") : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        {due && (
          <>
            <DialogHeader>
              <DialogTitle>{due.title}</DialogTitle>
              <DialogDescription>
                ₦{due.amount.toLocaleString()} · {paid.length}/{members.length} paid
              </DialogDescription>
            </DialogHeader>

            <div className="mt-5 flex max-h-[60vh] flex-col gap-6 overflow-y-auto">
              <div>
                <h4 className="flex items-center gap-1.5 text-[13px] font-semibold text-primary">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} />
                  Paid ({paid.length})
                </h4>
                {paid.length === 0 ? (
                  <p className="mt-2 text-[13px] text-ink-soft">Nobody has paid this yet.</p>
                ) : (
                  <div className="mt-2 flex flex-col divide-y divide-hairline rounded-md border border-hairline">
                    {paid.map((m) => {
                      const payment = m.payments[due.id]
                      return (
                        <div key={m.id} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                          <div>
                            <p className="text-[13px] font-medium text-ink">{m.name}</p>
                            <p className="text-[12px] text-ink-soft">{m.phone}</p>
                          </div>
                          {payment && (
                            <StatusPill
                              status={payment.status}
                              verified={payment.verified}
                              flagged={payment.flagged}
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-[13px] font-semibold text-ink-soft">Not paid ({notPaid.length})</h4>
                {notPaid.length === 0 ? (
                  <p className="mt-2 text-[13px] text-ink-soft">Everyone has paid this.</p>
                ) : (
                  <div className="mt-2 flex flex-col divide-y divide-hairline rounded-md border border-hairline">
                    {notPaid.map((m) => {
                      const payment = m.payments[due.id]
                      return (
                        <div key={m.id} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                          <div>
                            <p className="text-[13px] font-medium text-ink">{m.name}</p>
                            <p className="text-[12px] text-ink-soft">{m.phone}</p>
                          </div>
                          <StatusPill
                            status={payment?.status ?? "PENDING"}
                            verified={payment?.verified ?? false}
                            flagged={payment?.flagged}
                          />
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export { DueDetailDialog }
