"use client"

import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { Wallet01Icon } from "@hugeicons/core-free-icons"

import { Avatar } from "@/components/dashboard/avatar"
import { cn } from "@/lib/utils"

export type DashboardRole = "STUDENT" | "REP"

const VIEWS: { value: DashboardRole; label: string }[] = [
  { value: "STUDENT", label: "Student" },
  { value: "REP", label: "Course rep" },
]

function ViewAsSwitch({
  role,
  onRoleChange,
  className,
}: {
  role: DashboardRole
  onRoleChange: (role: DashboardRole) => void
  className?: string
}) {
  return (
    <div className={cn("flex items-center gap-1 rounded-full bg-cloud p-1", className)} role="tablist">
      <span className="hidden pl-2 pr-0.5 font-sans text-[12px] font-medium text-ink-soft lg:inline">
        View as
      </span>
      {VIEWS.map((view) => (
        <button
          key={view.value}
          type="button"
          role="tab"
          aria-selected={role === view.value}
          onClick={() => onRoleChange(view.value)}
          className={cn(
            "cursor-pointer rounded-full px-3 py-1.5 font-sans text-[13px] font-medium leading-none whitespace-nowrap transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
            role === view.value ? "bg-canvas text-ink shadow-sm" : "text-ink-soft hover:text-ink"
          )}
        >
          {view.label}
        </button>
      ))}
    </div>
  )
}

function Topbar({
  role,
  onRoleChange,
  name,
  balance,
}: {
  role: DashboardRole
  onRoleChange: (role: DashboardRole) => void
  name: string
  balance: number
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-canvas/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3 sm:gap-5">
          <Link href="/" className="shrink-0 text-[17px] font-semibold tracking-tight text-ink">
            Duelite.
          </Link>
          <ViewAsSwitch role={role} onRoleChange={onRoleChange} className="hidden sm:flex" />
        </div>

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

      <div className="border-t border-hairline px-4 py-2 sm:hidden">
        <ViewAsSwitch role={role} onRoleChange={onRoleChange} />
      </div>
    </header>
  )
}

export { Topbar }
