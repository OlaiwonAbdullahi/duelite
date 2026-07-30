import { NextResponse } from "next/server"

import { getCurrentUser } from "@/lib/auth-helpers"
import { getDashboardData, NoManagedSpaceError } from "@/lib/services/dashboard"

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    const data = await getDashboardData(user)
    return NextResponse.json(data)
  } catch (err) {
    if (err instanceof NoManagedSpaceError) {
      return NextResponse.json({ error: err.message }, { status: 404 })
    }
    throw err
  }
}
