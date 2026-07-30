"use client"

import { Topbar } from "@/components/dashboard/topbar"
import { DashboardNav, DashboardMobileNav } from "@/components/dashboard/dashboard-nav"
import { DueyChat } from "@/components/dashboard/duey-chat"
import { DashboardProvider, useDashboard } from "@/components/dashboard/dashboard-context"

function DashboardChrome({ children }: { children: React.ReactNode }) {
  const { loading, name, balance } = useDashboard()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <p className="text-[14px] text-ink-soft">Loading your dashboard…</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <Topbar name={name} balance={balance} />
      <div className="mx-auto flex w-full max-w-[1280px] flex-1">
        <DashboardNav />
        <main className="min-w-0 flex-1 px-4 py-8 pb-24 sm:px-6 sm:pb-8 lg:px-8">{children}</main>
      </div>
      <DashboardMobileNav />
      <DueyChat />
    </div>
  )
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <DashboardChrome>{children}</DashboardChrome>
    </DashboardProvider>
  )
}

export { DashboardShell }
