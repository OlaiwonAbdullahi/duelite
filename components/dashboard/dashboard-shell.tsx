"use client"

import { useSearchParams } from "next/navigation"

import { Topbar, type DashboardRole } from "@/components/dashboard/topbar"
import { DashboardNav, DashboardMobileNav } from "@/components/dashboard/dashboard-nav"
import { DashboardProvider, useDashboard } from "@/components/dashboard/dashboard-context"

function DashboardChrome({ children }: { children: React.ReactNode }) {
  const { role, setRole, name, balance } = useDashboard()

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <Topbar role={role} onRoleChange={setRole} name={name} balance={balance} />
      <div className="mx-auto flex w-full max-w-[1280px] flex-1">
        <DashboardNav />
        <main className="min-w-0 flex-1 px-4 py-8 pb-24 sm:px-6 sm:pb-8 lg:px-8">{children}</main>
      </div>
      <DashboardMobileNav />
    </div>
  )
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams()
  const initialRole: DashboardRole = searchParams.get("role") === "rep" ? "REP" : "STUDENT"

  return (
    <DashboardProvider initialRole={initialRole}>
      <DashboardChrome>{children}</DashboardChrome>
    </DashboardProvider>
  )
}

export { DashboardShell }
