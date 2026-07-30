// Shared frontend types — mirrors the shapes the API routes return.

export type PayStatus = "PENDING" | "PAID" | "FAILED"

export interface DuesItem {
  id: string
  title: string
  amount: number
  status: PayStatus
  verified: boolean
  flagged: boolean
  bmoniTxRef?: string
  paidAt?: string
}

export interface StudentSpace {
  id: string
  name: string
  joinCode: string
  items: DuesItem[]
}

export interface MemberPayment {
  status: PayStatus
  verified: boolean
  flagged: boolean
  bmoniTxRef?: string
  paidAt?: string
}

export interface MemberRow {
  id: string
  name: string
  phone: string
  level: string
  payments: Record<string, MemberPayment>
}

export interface RepItem {
  id: string
  title: string
  amount: number
}

export interface AnomalyAlert {
  id: string
  memberName: string
  itemTitle: string
  reason: string
  createdAt: string
}

export interface ManagedSpace {
  id: string
  name: string
  joinCode: string
  walletAddress: string
}
