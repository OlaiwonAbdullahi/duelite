import { NextRequest, NextResponse } from "next/server"

import { checkAdminSecret, createAdminSession } from "@/lib/admin-session"

export async function POST(request: NextRequest) {
  const body = await request.json()
  const secret = String(body.secret ?? "")

  if (!checkAdminSecret(secret)) {
    return NextResponse.json({ error: "Invalid admin secret" }, { status: 401 })
  }

  await createAdminSession(secret)
  return NextResponse.json({ ok: true })
}
