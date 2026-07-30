"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Download01Icon } from "@hugeicons/core-free-icons"

import { Card } from "@/components/ui/card"
import { DueDetailDialog } from "@/components/dashboard/due-detail-dialog"
import type { MemberPayment, MemberRow, RepItem } from "@/lib/types"

function statusLabel(payment: MemberPayment | undefined) {
  if (!payment) return "Unpaid"
  if (payment.flagged) return "Flagged"
  if (payment.status === "PAID" && payment.verified) return "Verified"
  if (payment.status === "PAID" && !payment.verified) return "Paid (confirming)"
  if (payment.status === "FAILED") return "Failed"
  return "Unpaid"
}

function csvField(value: string) {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

function downloadCsv(filename: string, rows: string[][]) {
  const content = rows.map((row) => row.map(csvField).join(",")).join("\n")
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function MembersDuesPanel({
  spaceName,
  members,
  items,
}: {
  spaceName: string
  members: MemberRow[]
  items: RepItem[]
}) {
  const [selectedDue, setSelectedDue] = useState<RepItem | null>(null)

  function handleExport() {
    const header = ["Name", "Phone", ...items.map((item) => item.title)]
    const rows = members.map((member) => [
      member.name,
      member.phone,
      ...items.map((item) => statusLabel(member.payments[item.id])),
    ])
    const slug = spaceName.trim().replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "space"
    downloadCsv(`${slug}-members.csv`, [header, ...rows])
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleExport}
          disabled={members.length === 0}
          className="flex items-center gap-2 rounded-full bg-cloud px-4 py-2 font-mono text-[13px] font-medium text-ink transition-colors duration-300 hover:bg-hairline disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        >
          <HugeiconsIcon icon={Download01Icon} size={14} />
          Export CSV
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="flex flex-col divide-y divide-hairline p-0">
          <div className="px-5 py-3 text-[12px] font-medium text-ink-soft">
            Members ({members.length})
          </div>
          {members.map((member) => (
            <div key={member.id} className="px-5 py-3.5">
              <p className="text-[14px] font-medium text-ink">{member.name}</p>
              <p className="text-[12px] text-ink-soft">{member.phone}</p>
            </div>
          ))}
        </Card>

        <Card className="flex flex-col divide-y divide-hairline p-0">
          <div className="px-5 py-3 text-[12px] font-medium text-ink-soft">Dues ({items.length})</div>
          {items.length === 0 ? (
            <p className="px-5 py-6 text-[13px] text-ink-soft">
              No dues created yet — use &ldquo;New payment item&rdquo; above to add one.
            </p>
          ) : (
            items.map((item) => {
              const paidCount = members.filter((m) => m.payments[item.id]?.status === "PAID").length
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedDue(item)}
                  className="flex items-center justify-between gap-3 px-5 py-3.5 text-left transition-colors duration-300 hover:bg-cloud/50 cursor-pointer"
                >
                  <div>
                    <p className="text-[14px] font-medium text-ink">{item.title}</p>
                    <p className="text-[12px] text-ink-soft">₦{item.amount.toLocaleString()}</p>
                  </div>
                  <span className="shrink-0 text-[12px] font-medium text-ink-soft">
                    {paidCount}/{members.length} paid
                  </span>
                </button>
              )
            })
          )}
        </Card>
      </div>

      <DueDetailDialog
        due={selectedDue}
        members={members}
        onOpenChange={(open) => {
          if (!open) setSelectedDue(null)
        }}
      />
    </div>
  )
}

export { MembersDuesPanel }
