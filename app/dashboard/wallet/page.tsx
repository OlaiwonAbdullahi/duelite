"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Copy01Icon, MoneyReceive01Icon, Wallet01Icon } from "@hugeicons/core-free-icons"

import { Card } from "@/components/ui/card"
import { StatTile } from "@/components/dashboard/stat-tile"
import { PayoutCard } from "@/components/dashboard/payout-card"
import { useDashboard } from "@/components/dashboard/dashboard-context"

function WalletPage() {
  const { role, studentBalance, spaces, walletAddress, managedSpace, repBalance, refreshDashboard } = useDashboard()
  const isRep = role === "REP"
  const [copied, setCopied] = useState(false)

  const paidTotal = spaces
    .flatMap((s) => s.items)
    .filter((i) => i.status === "PAID")
    .reduce((sum, i) => sum + i.amount, 0)

  function handleCopyAddress() {
    if (!walletAddress) return
    navigator.clipboard?.writeText(walletAddress).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-[24px] font-semibold text-ink">Wallet</h1>
        <p className="mt-1 text-[14px] text-ink-soft">
          Your personal BMONI-secured wallet, funded by bank transfer.
        </p>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_260px]">
          <Card className="flex flex-col justify-between gap-6 p-6">
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-full bg-cloud">
                <HugeiconsIcon icon={Wallet01Icon} size={18} color="var(--primary)" />
              </div>
              <p className="text-[14px] font-semibold text-ink">Your balance</p>
            </div>

            <div>
              <p className="text-[13px] text-ink-soft">Available</p>
              <p className="mt-1 text-[36px] font-semibold leading-none text-ink">
                ₦{studentBalance.toLocaleString()}
              </p>
            </div>

            {walletAddress && (
              <button
                type="button"
                onClick={handleCopyAddress}
                className="flex w-fit items-center gap-2 rounded-full bg-cloud px-3 py-1.5 font-mono text-[12px] font-medium text-ink-soft transition-colors duration-300 hover:bg-hairline cursor-pointer"
              >
                <HugeiconsIcon icon={Copy01Icon} size={13} />
                {copied ? "Copied!" : walletAddress}
              </button>
            )}
          </Card>

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
        <div>
          <h2 className="text-[16px] font-semibold text-ink">Space payout</h2>
          <p className="mt-1 text-[13px] text-ink-soft">
            Withdraw dues collected by your department to your bank.
          </p>
          <div className="mt-4 max-w-sm">
            <PayoutCard balance={repBalance} onWithdrawn={refreshDashboard} />
          </div>
        </div>
      )}
    </div>
  )
}

export default WalletPage
