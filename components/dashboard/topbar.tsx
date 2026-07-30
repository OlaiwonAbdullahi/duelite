"use client"

import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { Wallet01Icon } from "@hugeicons/core-free-icons"

import { Avatar } from "@/components/dashboard/avatar"

export type DashboardRole = "STUDENT" | "REP"

function Topbar({
  name,
  balance,
}: {
  name: string
  balance: number
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-canvas/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0 text-[17px] font-semibold tracking-tight text-ink">
          Duelite.
        </Link>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2 rounded-full bg-cloud px-3 py-1.5 sm:px-4">
            <HugeiconsIcon icon={Wallet01Icon} size={16} color="var(--primary)" />
            <span className="font-sans text-[13px] font-semibold text-ink">
              ₦{balance.toLocaleString()}
            </span>
          </div>

          <Avatar name={name} size={36} className="hidden lg:block" />
        </div>
      </div>
    </header>
  )
}

export { Topbar }
