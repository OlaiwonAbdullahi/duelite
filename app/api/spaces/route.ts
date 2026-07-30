import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth-helpers"
import { provisionAccount } from "@/lib/bmoni"
import { encryptSecret } from "@/lib/encryption"
import { generateJoinCode, generateSyntheticPhone } from "@/lib/identifiers"

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }
  if (user.role !== "REP") {
    return NextResponse.json({ error: "Only course reps can create a space" }, { status: 403 })
  }

  const body = await request.json()
  const name = String(body.name ?? "").trim()
  if (!name) {
    return NextResponse.json({ error: "Space name is required" }, { status: 400 })
  }

  const joinCode = await generateJoinCode()

  let provisioned
  try {
    provisioned = await provisionAccount({ name, phone: generateSyntheticPhone() })
  } catch (err) {
    console.error("provisionAccount failed for space creation:", err)
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: `Couldn't set up the department's BMONI wallet: ${message}` }, { status: 502 })
  }

  const space = await prisma.space.create({
    data: {
      name,
      joinCode,
      repId: user.id,
      bmoniUserId: provisioned.bmoniUserId,
      walletId: provisioned.walletId,
      walletAddress: provisioned.walletAddress,
      ownerKeyEnc: encryptSecret(provisioned.ownerPrivateKey),
    },
  })

  return NextResponse.json({
    space: { id: space.id, name: space.name, joinCode: space.joinCode, walletAddress: space.walletAddress },
  })
}

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const spaces = await prisma.space.findMany({
    where: { repId: user.id },
    select: { id: true, name: true, joinCode: true, walletAddress: true },
  })

  return NextResponse.json({ spaces })
}
