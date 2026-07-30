"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import type { DashboardRole } from "@/components/dashboard/topbar"
import { apiFetch } from "@/lib/api-client"
import type { StudentSpace, RepItem, MemberRow, AnomalyAlert, ManagedSpace } from "@/lib/types"

interface MeResponse {
  user: {
    id: string
    name: string
    role: "STUDENT" | "REP"
    level: string | null
    phone: string
    provisioned: boolean
    provisionError: string | null
    walletAddress: string | null
  }
  managedSpace: { id: string; name: string; joinCode: string } | null
}

interface MyDuesResponse {
  balance: number
  walletAddress: string | null
  spaces: StudentSpace[]
}

interface DashboardTotals {
  totalExpected: number
  totalCollected: number
  verifiedCount: number
  memberCount: number
}

interface DashboardResponse {
  space: ManagedSpace
  items: RepItem[]
  members: MemberRow[]
  totals: DashboardTotals
  repBalance: number
  anomalies: AnomalyAlert[]
}

interface DashboardContextValue {
  loading: boolean
  role: DashboardRole

  name: string
  subtitle: string
  balance: number
  provisioned: boolean
  walletAddress: string | null

  studentBalance: number
  spaces: StudentSpace[]
  refreshMyDues: () => Promise<void>

  managedSpace: ManagedSpace | null
  repBalance: number
  items: RepItem[]
  members: MemberRow[]
  totals: DashboardTotals
  anomalies: AnomalyAlert[]
  refreshDashboard: () => Promise<void>

  logout: () => Promise<void>
}

const DashboardContext = createContext<DashboardContextValue | null>(null)

const EMPTY_TOTALS: DashboardTotals = { totalExpected: 0, totalCollected: 0, verifiedCount: 0, memberCount: 0 }

function DashboardProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<DashboardRole>("STUDENT")

  const [me, setMe] = useState<MeResponse["user"] | null>(null)

  const [studentBalance, setStudentBalance] = useState(0)
  const [spaces, setSpaces] = useState<StudentSpace[]>([])

  const [managedSpace, setManagedSpace] = useState<ManagedSpace | null>(null)
  const [repBalance, setRepBalance] = useState(0)
  const [items, setItems] = useState<RepItem[]>([])
  const [members, setMembers] = useState<MemberRow[]>([])
  const [totals, setTotals] = useState<DashboardTotals>(EMPTY_TOTALS)
  const [anomalies, setAnomalies] = useState<AnomalyAlert[]>([])

  const refreshMyDues = useCallback(async () => {
    const data = await apiFetch<MyDuesResponse>("/api/my-dues")
    setStudentBalance(data.balance)
    setSpaces(data.spaces)
  }, [])

  const refreshDashboard = useCallback(async () => {
    try {
      const data = await apiFetch<DashboardResponse>("/api/dashboard")
      setManagedSpace(data.space)
      setRepBalance(data.repBalance)
      setItems(data.items)
      setMembers(data.members)
      setTotals(data.totals)
      setAnomalies(data.anomalies)
    } catch {
      setManagedSpace(null)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      try {
        const meData = await apiFetch<MeResponse>("/api/auth/me")
        if (cancelled) return
        setMe(meData.user)
        setRole(meData.managedSpace ? "REP" : "STUDENT")
        await refreshMyDues()
        if (meData.managedSpace) await refreshDashboard()
      } catch {
        router.push("/login")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    bootstrap()
    return () => {
      cancelled = true
    }
    // Only run once on mount — refreshMyDues/refreshDashboard are stable
    // useCallbacks and router identity doesn't need to retrigger this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function logout() {
    await apiFetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
  }

  const isStudent = role === "STUDENT"

  const value: DashboardContextValue = {
    loading,
    role,

    name: me?.name ?? "",
    subtitle: isStudent ? (me?.level ?? "Student") : "Course rep",
    balance: studentBalance,
    provisioned: me?.provisioned ?? false,
    walletAddress: me?.walletAddress ?? null,

    studentBalance,
    spaces,
    refreshMyDues,

    managedSpace,
    repBalance,
    items,
    members,
    totals,
    anomalies,
    refreshDashboard,

    logout,
  }

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>
}

function useDashboard() {
  const ctx = useContext(DashboardContext)
  if (!ctx) throw new Error("useDashboard must be used within a DashboardProvider")
  return ctx
}

export { DashboardProvider, useDashboard }
