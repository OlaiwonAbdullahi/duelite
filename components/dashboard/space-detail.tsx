"use client"

import { useState } from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft02Icon, Building06Icon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"

import { Card } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { StatusPill } from "@/components/dashboard/status-pill"
import { EmptyState } from "@/components/dashboard/empty-state"
import { PayDialog } from "@/components/dashboard/pay-dialog"
import { BatchPayDialog, type BatchPayItemResult } from "@/components/dashboard/batch-pay-dialog"
import { useDashboard } from "@/components/dashboard/dashboard-context"
import { apiFetch, ApiError } from "@/lib/api-client"
import type { DuesItem } from "@/lib/types"
import { cn } from "@/lib/utils"

function SpaceDetail({ spaceId }: { spaceId: string }) {
  const { spaces, studentBalance, refreshMyDues } = useDashboard()
  const [payItemId, setPayItemId] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [batchTarget, setBatchTarget] = useState<DuesItem[] | null>(null)

  const space = spaces.find((s) => s.id === spaceId) ?? null

  if (!space) {
    return (
      <div className="flex flex-col gap-6">
        <BackLink />
        <EmptyState
          icon={Building06Icon}
          title="Space not found"
          description="This space may have been removed, or you haven't joined it."
        />
      </div>
    )
  }

  const activeItem = space.items.find((i) => i.id === payItemId) ?? null
  const unpaidItems = space.items.filter((i) => i.status !== "PAID")
  const selectedItems = space.items.filter((i) => selected.has(i.id))
  const selectedTotal = selectedItems.reduce((sum, i) => sum + i.amount, 0)
  const allSelected = unpaidItems.length > 0 && unpaidItems.every((i) => selected.has(i.id))

  function toggleItem(itemId: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (checked) next.add(itemId)
      else next.delete(itemId)
      return next
    })
  }

  function toggleSelectAll() {
    setSelected(allSelected ? new Set() : new Set(unpaidItems.map((i) => i.id)))
  }

  async function handleConfirmPay(): Promise<{ ok: boolean; error?: string }> {
    if (!activeItem) return { ok: false, error: "No item selected" }
    try {
      await apiFetch("/api/pay", {
        method: "POST",
        body: JSON.stringify({ itemId: activeItem.id }),
      })
      await refreshMyDues()
      return { ok: true }
    } catch (err) {
      return { ok: false, error: err instanceof ApiError ? err.message : "Payment failed. Try again." }
    }
  }

  async function handleConfirmBatchPay(): Promise<{
    ok: boolean
    error?: string
    results: BatchPayItemResult[]
  }> {
    if (!batchTarget || batchTarget.length === 0) {
      return { ok: false, error: "No items selected", results: [] }
    }
    try {
      const data = await apiFetch<{
        payments: { itemId: string }[]
        failed: { itemId: string; error: string }[]
      }>("/api/pay/batch", {
        method: "POST",
        body: JSON.stringify({ itemIds: batchTarget.map((i) => i.id) }),
      })
      const results: BatchPayItemResult[] = [
        ...data.payments.map((p) => ({ itemId: p.itemId, ok: true })),
        ...data.failed.map((f) => ({ itemId: f.itemId, ok: false, error: f.error })),
      ]
      await refreshMyDues()
      setSelected(new Set())
      return { ok: data.failed.length === 0, results }
    } catch (err) {
      return {
        ok: false,
        error: err instanceof ApiError ? err.message : "Payment failed. Try again.",
        results: [],
      }
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <BackLink />

      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-[24px] font-semibold text-ink">{space.name}</h1>
        <span className="w-fit rounded-full bg-cloud px-3 py-1.5 font-mono text-[13px] font-medium text-ink-soft">
          {space.joinCode}
        </span>
      </div>

      {space.items.length === 0 ? (
        <EmptyState
          icon={CheckmarkCircle02Icon}
          title="No dues yet"
          description="Your course rep hasn't added any payment items to this space. Check back later."
        />
      ) : (
        <>
          <div className="flex items-center justify-between">
            {unpaidItems.length > 1 ? (
              <button
                type="button"
                onClick={toggleSelectAll}
                className="text-[13px] font-medium text-primary hover:underline cursor-pointer"
              >
                {allSelected ? "Clear selection" : "Select all unpaid"}
              </button>
            ) : (
              <span />
            )}

            {selected.size > 0 && (
              <div className="flex items-center gap-3 rounded-full bg-cloud py-1.5 pr-1.5 pl-4">
                <span className="text-[13px] font-medium text-ink">
                  {selected.size} selected · ₦{selectedTotal.toLocaleString()}
                </span>
                <button
                  type="button"
                  onClick={() => setBatchTarget(selectedItems)}
                  className={cn(buttonVariants({ size: "sm" }))}
                >
                  Pay selected
                </button>
              </div>
            )}
          </div>

          <Card className="flex flex-col divide-y divide-hairline p-0">
            {space.items.map((item) => {
              const payable = item.status !== "PAID"
              return (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    {payable ? (
                      <Checkbox
                        checked={selected.has(item.id)}
                        onCheckedChange={(checked) => toggleItem(item.id, checked)}
                        aria-label={`Select ${item.title}`}
                      />
                    ) : (
                      <span className="size-5 shrink-0" />
                    )}
                    <div>
                      <p className="text-[14px] font-medium text-ink">{item.title}</p>
                      <p className="mt-1 text-[13px] text-ink-soft">₦{item.amount.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusPill status={item.status} verified={item.verified} flagged={item.flagged} />
                    {payable && (
                      <button
                        type="button"
                        onClick={() => setPayItemId(item.id)}
                        className={cn(buttonVariants({ size: "sm" }))}
                      >
                        Pay ₦{item.amount.toLocaleString()}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </Card>
        </>
      )}

      <PayDialog
        item={activeItem}
        spaceName={space.name}
        balance={studentBalance}
        onOpenChange={(open) => {
          if (!open) setPayItemId(null)
        }}
        onConfirm={handleConfirmPay}
      />

      <BatchPayDialog
        items={batchTarget}
        spaceName={space.name}
        balance={studentBalance}
        onOpenChange={(open) => {
          if (!open) setBatchTarget(null)
        }}
        onConfirm={handleConfirmBatchPay}
      />
    </div>
  )
}

function BackLink() {
  return (
    <Link
      href="/dashboard/space"
      className="flex w-fit items-center gap-1.5 text-[13px] font-medium text-ink-soft transition-colors duration-300 hover:text-ink"
    >
      <HugeiconsIcon icon={ArrowLeft02Icon} size={14} />
      Back to spaces
    </Link>
  )
}

export { SpaceDetail }
