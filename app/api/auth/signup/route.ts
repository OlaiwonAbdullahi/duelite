import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth-helpers"
import { createSession } from "@/lib/session"
import { provisionAccount } from "@/lib/bmoni"
import { encryptSecret } from "@/lib/encryption"
import { normalizeNigerianPhone } from "@/lib/identifiers"

export async function POST(request: NextRequest) {
  const body = await request.json()
  const name = String(body.name ?? "").trim()
  const rawPhone = String(body.phone ?? "").trim()
  const password = String(body.password ?? "")
  const role = body.role === "REP" ? "REP" : "STUDENT"
  const level = body.level ? String(body.level) : null

  if (!name || !rawPhone || !password) {
    return NextResponse.json({ error: "name, phone, and password are required" }, { status: 400 })
  }

  const phone = normalizeNigerianPhone(rawPhone)
  if (phone.replace(/\D/g, "").length < 13) {
    return NextResponse.json({ error: "Enter a valid Nigerian phone number" }, { status: 400 })
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
  }

  const passwordHash = await hashPassword(password)

  let user
  try {
    user = await prisma.user.create({
      data: { name, phone, passwordHash, role, level },
    })
  } catch (err) {
    if (isPrismaKnownRequestError(err, "P2002")) {
      const target = Array.isArray(err.meta?.target) ? err.meta.target.join(", ") : String(err.meta?.target ?? "")
      const message = target.includes("phone")
        ? "An account with this phone number already exists"
        : `Signup failed on a duplicate ${target || "field"} — try again`
      return NextResponse.json({ error: message }, { status: 409 })
    }
    throw err
  }

  // details.md suggests firing this in the background so signup doesn't
  // block — but Next.js API routes on serverless hosting can't reliably
  // outlive the response, so it's awaited here instead. Sandbox runs of
  // provisionAccount() take ~3-6s in practice.
  try {
    const provisioned = await provisionAccount({ name, phone })
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        bmoniUserId: provisioned.bmoniUserId,
        walletId: provisioned.walletId,
        walletAddress: provisioned.walletAddress,
        ownerKeyEnc: encryptSecret(provisioned.ownerPrivateKey),
        provisioned: true,
      },
    })
  } catch (err) {
    console.error("provisionAccount failed during signup:", err)
    user = await prisma.user.update({
      where: { id: user.id },
      data: { provisionError: err instanceof Error ? err.message : String(err) },
    })
  }

  await createSession(user.id)

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      role: user.role,
      level: user.level,
      provisioned: user.provisioned,
    },
  })
}

function isPrismaKnownRequestError(
  error: unknown,
  code: string,
): error is { code: string; meta?: { target?: string | string[] } } {
  return typeof error === "object" && error !== null && "code" in error && error.code === code
}
