"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Copy01Icon, MoneyReceive01Icon, Refresh01Icon, Wallet01Icon } from "@hugeicons/core-free-icons"
import { toast } from "sonner"

import { StatTile } from "@/components/dashboard/stat-tile"
import { PayoutCard } from "@/components/dashboard/payout-card"
import { WithdrawalDetailsCard } from "@/components/dashboard/withdrawal-details-card"
import { useDashboard } from "@/components/dashboard/dashboard-context"
import { cn } from "@/lib/utils"

function WalletPage() {
  const {
    role,
    studentBalance,
    spaces,
    walletAddress,
    managedSpace,
    repBalance,
    refreshMyDues,
    refreshDashboard,
  } = useDashboard()
  const isRep = role === "REP"
  const [refreshing, setRefreshing] = useState(false)

  const paidTotal = spaces
    .flatMap((s) => s.items)
    .filter((i) => i.status === "PAID")
    .reduce((sum, i) => sum + i.amount, 0)

  function handleCopyAddress() {
    if (!walletAddress) return
    navigator.clipboard?.writeText(walletAddress).catch(() => {})
    toast.success("Wallet address copied")
  }

  async function handleRefresh() {
    setRefreshing(true)
    try {
      await Promise.all([refreshMyDues(), ...(isRep ? [refreshDashboard()] : [])])
      toast.success("Wallet refreshed")
    } catch {
      toast.error("Couldn't refresh — try again.")
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div className="flex flex-col gap-10">
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-[24px] font-semibold text-ink">Wallet</h1>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            aria-label="Refresh wallet"
            className="flex items-center gap-1.5 rounded-full border border-hairline px-3 py-1.5 font-sans text-[12px] font-medium text-ink-soft transition-colors duration-300 hover:bg-cloud hover:text-ink disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            <HugeiconsIcon icon={Refresh01Icon} size={14} className={cn(refreshing && "animate-spin")} />
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>
        <p className="mt-1 text-[14px] text-ink-soft">
          Your personal BMONI-secured wallet, funded by bank transfer.
        </p>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_260px]">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-deep via-primary to-primary-bright p-7 text-on-primary shadow-[0_24px_60px_-20px_rgba(11,110,79,0.5)] sm:p-8">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.15]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                backgroundSize: "18px 18px",
              }}
            />
            <div className="pointer-events-none absolute -top-16 -right-10 size-56 rounded-full bg-white/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-10 size-56 rounded-full bg-accent-gold/25 blur-3xl" />

            <div className="relative flex h-full flex-col justify-between gap-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-10 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
                    <HugeiconsIcon icon={Wallet01Icon} size={19} color="white" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold leading-tight">Duelite Wallet</p>
                    <p className="text-[12px] leading-tight text-on-primary/60">BMONI-secured</p>
                  </div>
                </div>
                <span className="rounded-full bg-white/15 px-3 py-1 font-mono text-[11px] font-semibold tracking-wide backdrop-blur-sm">
                  cNGN
                </span>
              </div>

              <div>
                <p className="text-[13px] text-on-primary/70">Available balance</p>
                <p className="mt-1.5 text-[42px] font-semibold leading-none tracking-tight tabular-nums">
                  ₦{studentBalance.toLocaleString()}
                </p>
              </div>

              {walletAddress && (
                <button
                  type="button"
                  onClick={handleCopyAddress}
                  className="flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 font-mono text-[12px] font-medium text-on-primary/90 backdrop-blur-sm transition-colors duration-300 hover:bg-white/20 cursor-pointer"
                >
                  <HugeiconsIcon icon={Copy01Icon} size={13} />
                  {walletAddress}
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
            <StatTile
              label="Total paid"
              value={`₦${paidTotal.toLocaleString()}`}
              icon={MoneyReceive01Icon}
            />
            <StatTile label="Spaces joined" value={`${spaces.length}`} icon={Wallet01Icon} />
          </div>
        </div>
      </div>

      {isRep && managedSpace && (
        <section className="border-t border-hairline pt-8">
          <div className="max-w-2xl">
            <h2 className="text-[18px] font-semibold text-ink">Department withdrawals</h2>
            <p className="mt-1 text-[13px] text-ink-soft">
              Set the verified Nigerian account that receives payouts from {managedSpace.name}.
            </p>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <WithdrawalDetailsCard />
              <PayoutCard balance={repBalance} onWithdrawn={refreshDashboard} />
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default WalletPage
