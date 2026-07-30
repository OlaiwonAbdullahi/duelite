"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  AiChat02Icon,
  Alert01Icon,
  Building06Icon,
  CheckmarkCircle02Icon,
  MoneyReceive01Icon,
  UserGroupIcon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons"

import { StatTile } from "@/components/dashboard/stat-tile"
import { useDashboard } from "@/components/dashboard/dashboard-context"

function OverviewPage() {
  const { role, studentBalance, spaces, totals, anomalies } = useDashboard()
  const isRep = role === "REP"

  const outstanding = spaces
    .flatMap((s) => s.items)
    .filter((i) => i.status !== "PAID")
    .reduce((sum, i) => sum + i.amount, 0)

  const paidTotal = spaces
    .flatMap((s) => s.items)
    .filter((i) => i.status === "PAID")
    .reduce((sum, i) => sum + i.amount, 0)

  const repOutstanding = totals.totalExpected - totals.totalCollected

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-[24px] font-semibold text-ink">Overview</h1>
        <p className="mt-1 text-[14px] text-ink-soft">
          Every payment below is a real transfer on BMONI&apos;s ledger.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <StatTile label="Wallet balance" value={`₦${studentBalance.toLocaleString()}`} icon={Wallet01Icon} />
          <StatTile
            label="Outstanding"
            value={`₦${outstanding.toLocaleString()}`}
            icon={CheckmarkCircle02Icon}
            iconColor="var(--accent-gold)"
          />
          <StatTile label="Spaces joined" value={`${spaces.length}`} icon={Building06Icon} />
        </div>

        <div className="mt-6 flex items-center gap-3 rounded-lg border border-hairline bg-paper px-5 py-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-cloud">
            <HugeiconsIcon icon={AiChat02Icon} size={18} color="var(--primary)" />
          </div>
          <p className="text-[13px] leading-[1.5] text-ink-soft">
            <span className="font-medium text-ink">Prefer WhatsApp?</span> Text Duey &ldquo;how much
            do I owe?&rdquo; or &ldquo;pay my dues&rdquo; and it&apos;ll walk you through the same
            flow — in English or Pidgin.
          </p>
        </div>

        <p className="mt-4 text-center text-[12px] text-ink-soft">
          {paidTotal > 0 && `You've sent ₦${paidTotal.toLocaleString()} through Duelite so far. `}
          Balances shown are BMONI sandbox test funds.
        </p>
      </div>

      {isRep && (
        <div>
          <h2 className="text-[16px] font-semibold text-ink">Your space</h2>
          <p className="mt-1 text-[13px] text-ink-soft">
            Stats for the department you manage as course rep.
          </p>

          {anomalies.length > 0 && (
            <div className="mt-4 flex flex-col gap-2 rounded-lg border border-accent-gold/30 bg-accent-gold/10 p-4">
              {anomalies.map((alert) => (
                <div key={alert.id} className="flex items-start gap-2.5">
                  <HugeiconsIcon
                    icon={Alert01Icon}
                    size={16}
                    color="var(--accent-gold)"
                    className="mt-0.5 shrink-0"
                  />
                  <p className="text-[13px] leading-[1.5] text-ink">
                    <span className="font-semibold">Duey flagged {alert.memberName}</span> ·{" "}
                    {alert.itemTitle} — {alert.reason}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile label="Collected" value={`₦${totals.totalCollected.toLocaleString()}`} icon={MoneyReceive01Icon} />
            <StatTile
              label="Outstanding"
              value={`₦${repOutstanding.toLocaleString()}`}
              icon={Alert01Icon}
              iconColor="var(--accent-gold)"
            />
            <StatTile label="Verified on ledger" value={`${totals.verifiedCount}`} icon={CheckmarkCircle02Icon} />
            <StatTile label="Members" value={`${totals.memberCount}`} icon={UserGroupIcon} />
          </div>
        </div>
      )}
    </div>
  )
}

export default OverviewPage
