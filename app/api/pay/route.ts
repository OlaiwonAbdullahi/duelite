import { NextRequest, NextResponse } from "next/server"

import { getCurrentUser } from "@/lib/auth-helpers"
import { payDue } from "@/lib/services/pay"

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const body = await request.json()
  const itemId = String(body.itemId ?? "")
  if (!itemId) {
    return NextResponse.json({ error: "itemId is required" }, { status: 400 })
  }

  const result = await payDue(user, itemId)
  if (!result.ok) {
    return NextResponse.json({ error: result.error, payment: result.payment }, { status: result.status })
  }

  return NextResponse.json({ payment: result.payment })
}
