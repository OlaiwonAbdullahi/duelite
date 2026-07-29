"use client"

import { createContext, useContext, useState, type Dispatch, type SetStateAction } from "react"

import type { DashboardRole } from "@/components/dashboard/topbar"
import {
  currentStudent,
  currentRep,
  repSpace,
  studentSpaces,
  type StudentSpace,
} from "@/lib/dummy-data"

interface RepItem {
  id: string
  title: string
  amount: number
}

interface DashboardContextValue {
  role: DashboardRole
  setRole: (role: DashboardRole) => void
  name: string
  subtitle: string
  balance: number

  studentBalance: number
  setStudentBalance: Dispatch<SetStateAction<number>>
  spaces: StudentSpace[]
  setSpaces: Dispatch<SetStateAction<StudentSpace[]>>

  repBalance: number
  setRepBalance: (balance: number) => void
  items: RepItem[]
  setItems: Dispatch<SetStateAction<RepItem[]>>
}

const DashboardContext = createContext<DashboardContextValue | null>(null)

function DashboardProvider({
  initialRole,
  children,
}: {
  initialRole: DashboardRole
  children: React.ReactNode
}) {
  const [role, setRole] = useState<DashboardRole>(initialRole)
  const [studentBalance, setStudentBalance] = useState(currentStudent.balance)
  const [repBalance, setRepBalance] = useState(repSpace.balance)
  const [spaces, setSpaces] = useState<StudentSpace[]>(studentSpaces)
  const [items, setItems] = useState<RepItem[]>(repSpace.items)

  const isStudent = role === "STUDENT"

  const value: DashboardContextValue = {
    role,
    setRole,
    name: isStudent ? currentStudent.name : currentRep.name,
    subtitle: isStudent ? (currentStudent.level ?? "Student") : "Course rep",
    balance: studentBalance,
    studentBalance,
    setStudentBalance,
    spaces,
    setSpaces,
    repBalance,
    setRepBalance,
    items,
    setItems,
  }

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>
}

function useDashboard() {
  const ctx = useContext(DashboardContext)
  if (!ctx) throw new Error("useDashboard must be used within a DashboardProvider")
  return ctx
}

export { DashboardProvider, useDashboard }
