// Static placeholder data for the DueLite UI. Shapes loosely follow the
// Prisma models but are pre-joined/denormalized for easy rendering — no real
// BMONI or database calls happen here.

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

export const currentStudent = {
  id: "u_ife",
  name: "Ifeoma Chukwu",
  level: "300L",
  phone: "+234 801 234 5678",
  walletAddress: "0x8f3aE1...c21d9B",
  balance: 1000,
}

export const studentSpaces: StudentSpace[] = [
  {
    id: "sp_csc300",
    name: "300L Computer Science Department",
    joinCode: "CSC300",
    items: [
      {
        id: "item_dues",
        title: "Departmental Dues",
        amount: 500,
        status: "PAID",
        verified: true,
        flagged: false,
        bmoniTxRef: "0x7ad239...91fe4c",
        paidAt: "2026-07-14T10:22:00Z",
      },
      {
        id: "item_dinner",
        title: "End of Semester Dinner",
        amount: 1000,
        status: "PENDING",
        verified: false,
        flagged: false,
      },
    ],
  },
  {
    id: "sp_scisug",
    name: "Faculty of Science SUG",
    joinCode: "SCI-SUG",
    items: [
      {
        id: "item_sug",
        title: "SUG Dues",
        amount: 300,
        status: "PENDING",
        verified: false,
        flagged: false,
      },
    ],
  },
]

// Spaces a student hasn't joined yet — keyed by join code, used to demo the
// "join by code" flow without a real backend lookup.
export const joinableSpaceDirectory: Record<string, StudentSpace> = {
  ENG200: {
    id: "sp_eng200",
    name: "200L Engineering Faculty",
    joinCode: "ENG200",
    items: [
      {
        id: "item_eng_dues",
        title: "Faculty Dues",
        amount: 400,
        status: "PENDING",
        verified: false,
        flagged: false,
      },
    ],
  },
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

export const currentRep = {
  id: "u_tobi",
  name: "Tobi Balogun",
  phone: "+234 803 555 1122",
  walletAddress: "0x4b21Fa...77aaC0",
}

export const repSpace = {
  id: "sp_csc300",
  name: "300L Computer Science Department",
  joinCode: "CSC300",
  walletAddress: "0x4b21Fa...77aaC0",
  balance: 6500,
  items: [
    { id: "item_dues", title: "Departmental Dues", amount: 500 },
    { id: "item_dinner", title: "End of Semester Dinner", amount: 1000 },
  ],
}

export const repMembers: MemberRow[] = [
  {
    id: "u_ife",
    name: "Ifeoma Chukwu",
    phone: "+234 801 234 5678",
    level: "300L",
    payments: {
      item_dues: { status: "PAID", verified: true, bmoniTxRef: "0x7ad239...91fe4c", paidAt: "2026-07-14T10:22:00Z", flagged: false },
      item_dinner: { status: "PENDING", verified: false, flagged: false },
    },
  },
  {
    id: "u_chidera",
    name: "Chidera Okafor",
    phone: "+234 802 118 4432",
    level: "300L",
    payments: {
      item_dues: { status: "PAID", verified: true, bmoniTxRef: "0x1cd870...2af931", paidAt: "2026-07-12T09:03:00Z", flagged: false },
      item_dinner: { status: "PAID", verified: true, bmoniTxRef: "0x9e0c41...aa310d", paidAt: "2026-07-20T16:40:00Z", flagged: false },
    },
  },
  {
    id: "u_segun",
    name: "Segun Adewale",
    phone: "+234 705 902 7761",
    level: "300L",
    payments: {
      item_dues: { status: "PAID", verified: true, bmoniTxRef: "0x33fa02...5b19ee", paidAt: "2026-07-15T14:11:00Z", flagged: false },
      item_dinner: { status: "PENDING", verified: false, flagged: false },
    },
  },
  {
    id: "u_blessing",
    name: "Blessing Nwachukwu",
    phone: "+234 810 447 2290",
    level: "300L",
    payments: {
      item_dues: { status: "PAID", verified: false, bmoniTxRef: "0xa0f512...cc4471", paidAt: "2026-07-29T08:05:00Z", flagged: false },
      item_dinner: { status: "PENDING", verified: false, flagged: false },
    },
  },
  {
    id: "u_kelechi",
    name: "Kelechi Eze",
    phone: "+234 706 331 8845",
    level: "300L",
    payments: {
      item_dues: { status: "PENDING", verified: false, flagged: false },
      item_dinner: { status: "PENDING", verified: false, flagged: false },
    },
  },
  {
    id: "u_amaka",
    name: "Amaka Obi",
    phone: "+234 813 220 9931",
    level: "300L",
    payments: {
      item_dues: { status: "PENDING", verified: false, flagged: false },
      item_dinner: { status: "PENDING", verified: false, flagged: false },
    },
  },
  {
    id: "u_fatima",
    name: "Fatima Bello",
    phone: "+234 809 774 1120",
    level: "300L",
    payments: {
      item_dues: { status: "PAID", verified: true, bmoniTxRef: "0x66be91...107fa2", paidAt: "2026-07-16T11:47:00Z", flagged: true },
      item_dinner: { status: "PENDING", verified: false, flagged: false },
    },
  },
  {
    id: "u_david",
    name: "David Okon",
    phone: "+234 903 118 6602",
    level: "300L",
    payments: {
      item_dues: { status: "PENDING", verified: false, flagged: false },
      item_dinner: { status: "PENDING", verified: false, flagged: false },
    },
  },
  {
    id: "u_grace",
    name: "Grace Effiong",
    phone: "+234 816 552 3387",
    level: "300L",
    payments: {
      item_dues: { status: "PAID", verified: true, bmoniTxRef: "0xd42a10...9c5561", paidAt: "2026-07-13T17:29:00Z", flagged: false },
      item_dinner: { status: "PAID", verified: true, bmoniTxRef: "0x51ff33...0e21ab", paidAt: "2026-07-21T12:02:00Z", flagged: false },
    },
  },
  {
    id: "u_isaac",
    name: "Isaac Umeh",
    phone: "+234 708 665 4471",
    level: "300L",
    payments: {
      item_dues: { status: "PENDING", verified: false, flagged: false },
      item_dinner: { status: "PENDING", verified: false, flagged: false },
    },
  },
]

export const anomalyAlerts = [
  {
    id: "flag_fatima_dues",
    memberName: "Fatima Bello",
    itemTitle: "Departmental Dues",
    reason: "Same item paid twice within 2 minutes — possible duplicate transfer.",
    createdAt: "2026-07-16T11:49:00Z",
  },
]

export const payoutInfo = {
  bankName: "GTBank",
  accountNumber: "•••• 4821",
  accountName: "Tobi Balogun",
  withdrawable: 6500,
  lastWithdrawal: {
    reference: "OFR-2947XK",
    amount: 12000,
    date: "2026-06-30T09:00:00Z",
  },
}

export const recentLedgerActivity = [
  { id: "tx1", label: "Grace Effiong → Departmental Dues", amount: 500, txRef: "0xd42a10...9c5561", time: "2026-07-13T17:29:00Z" },
  { id: "tx2", label: "Chidera Okafor → Departmental Dues", amount: 500, txRef: "0x1cd870...2af931", time: "2026-07-12T09:03:00Z" },
  { id: "tx3", label: "Segun Adewale → Departmental Dues", amount: 500, txRef: "0x33fa02...5b19ee", time: "2026-07-15T14:11:00Z" },
  { id: "tx4", label: "Fatima Bello → Departmental Dues", amount: 500, txRef: "0x66be91...107fa2", time: "2026-07-16T11:47:00Z" },
  { id: "tx5", label: "Chidera Okafor → End of Semester Dinner", amount: 1000, txRef: "0x9e0c41...aa310d", time: "2026-07-20T16:40:00Z" },
]
