import { NextResponse } from "next/server"

import { getCurrentUser } from "@/lib/auth-helpers"
import { getMyDuesData } from "@/lib/services/my-dues"

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const data = await getMyDuesData(user)
  return NextResponse.json(data)
}
