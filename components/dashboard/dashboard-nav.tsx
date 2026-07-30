"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { HugeiconsIcon, type HugeiconsIconProps } from "@hugeicons/react"
import {
  ArrowDataTransferHorizontalIcon,
  Building06Icon,
  DashboardSquare01Icon,
  Logout01Icon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons"

import { Avatar } from "@/components/dashboard/avatar"
import { useDashboard } from "@/components/dashboard/dashboard-context"
import { cn } from "@/lib/utils"

const NAV_ITEMS: { href: string; label: string; icon: HugeiconsIconProps["icon"] }[] = [
  { href: "/dashboard/overview", label: "Overview", icon: DashboardSquare01Icon },
  { href: "/dashboard/space", label: "Space", icon: Building06Icon },
  { href: "/dashboard/transaction", label: "Transactions", icon: ArrowDataTransferHorizontalIcon },
  { href: "/dashboard/wallet", label: "Wallet", icon: Wallet01Icon },
]

function DashboardNav() {
  const pathname = usePathname()
  const { name, subtitle, logout } = useDashboard()

  return (
    <aside className="hidden w-56 shrink-0 border-r border-hairline bg-canvas sm:block">
      <div className="sticky top-16 flex h-[calc(100vh-4rem)] flex-col justify-between">
        <nav className="flex flex-col gap-1 p-4">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2.5 font-sans text-[13px] font-medium transition-colors duration-300",
                  active
                    ? "bg-cloud text-ink"
                    : "text-ink-soft hover:bg-cloud/60 hover:text-ink"
                )}
              >
                <HugeiconsIcon
                  icon={item.icon}
                  size={17}
                  color={active ? "var(--primary)" : "currentColor"}
                />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex flex-col gap-3 border-t border-hairline p-4">
          <div className="flex items-center gap-2.5">
            <Avatar name={name} size={36} />
            <div className="min-w-0 leading-tight">
              <p className="truncate text-[13px] font-medium text-ink">{name}</p>
              <p className="truncate text-[12px] text-ink-soft">{subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => logout()}
            className="flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 font-sans text-[13px] font-medium text-ink-soft transition-colors duration-300 hover:bg-cloud/60 hover:text-ink"
          >
            <HugeiconsIcon icon={Logout01Icon} size={17} />
            Log out
          </button>
        </div>
      </div>
    </aside>
  )
}

function DashboardMobileNav() {
  const pathname = usePathname()
  const { logout } = useDashboard()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-hairline bg-canvas/95 backdrop-blur-md sm:hidden">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2.5 font-sans text-[11px] font-medium transition-colors duration-300",
              active ? "text-ink" : "text-ink-soft"
            )}
          >
            <HugeiconsIcon
              icon={item.icon}
              size={18}
              color={active ? "var(--primary)" : "currentColor"}
            />
            {item.label}
          </Link>
        )
      })}
      <button
        type="button"
        onClick={() => logout()}
        className="flex flex-1 cursor-pointer flex-col items-center gap-1 py-2.5 font-sans text-[11px] font-medium text-ink-soft transition-colors duration-300"
      >
        <HugeiconsIcon icon={Logout01Icon} size={18} />
        Log out
      </button>
    </nav>
  )
}

export { DashboardNav, DashboardMobileNav }
