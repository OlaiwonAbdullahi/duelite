"use client"

import { useState } from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft02Icon, Building06Icon } from "@hugeicons/core-free-icons"

import { Card } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { StatusPill } from "@/components/dashboard/status-pill"
import { EmptyState } from "@/components/dashboard/empty-state"
import { PayDialog } from "@/components/dashboard/pay-dialog"
import { useDashboard } from "@/components/dashboard/dashboard-context"
import { apiFetch, ApiError } from "@/lib/api-client"
import { cn } from "@/lib/utils"

function SpaceDetail({ spaceId }: { spaceId: string }) {
  const { spaces, studentBalance, refreshMyDues } = useDashboard()
  const [payItemId, setPayItemId] = useState<string | null>(null)

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

  return (
    <div className="flex flex-col gap-6">
      <BackLink />

      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-[24px] font-semibold text-ink">{space.name}</h1>
        <span className="w-fit rounded-full bg-cloud px-3 py-1.5 font-mono text-[13px] font-medium text-ink-soft">
          {space.joinCode}
        </span>
      </div>

      <Card className="flex flex-col divide-y divide-hairline p-0">
        {space.items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-[14px] font-medium text-ink">{item.title}</p>
              <p className="mt-1 text-[13px] text-ink-soft">₦{item.amount.toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-3">
              <StatusPill status={item.status} verified={item.verified} flagged={item.flagged} />
              {item.status !== "PAID" && (
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
        ))}
      </Card>

      <PayDialog
        item={activeItem}
        spaceName={space.name}
        balance={studentBalance}
        onOpenChange={(open) => {
          if (!open) setPayItemId(null)
        }}
        onConfirm={handleConfirmPay}
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
