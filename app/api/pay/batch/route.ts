import { NextRequest, NextResponse } from "next/server"

import { getCurrentUser } from "@/lib/auth-helpers"
import { payDues } from "@/lib/services/pay"

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const body = await request.json()
  const itemIds = Array.isArray(body.itemIds) ? body.itemIds.map(String) : []
  if (itemIds.length === 0) {
    return NextResponse.json({ error: "itemIds is required" }, { status: 400 })
  }

  const result = await payDues(user, itemIds)
  return NextResponse.json(
    { payments: result.payments, failed: result.failed, error: result.error },
    { status: result.status }
  )
}
