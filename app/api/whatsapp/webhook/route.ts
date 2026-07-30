import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import { sendWhatsAppText, verifyTwilioSignature } from "@/lib/whatsapp"
import { normalizeNigerianPhone } from "@/lib/identifiers"
import { runDuey } from "@/lib/duey/run"

// Twilio posts application/x-www-form-urlencoded, e.g.:
//   From=whatsapp:+2348012345678&Body=how much do I owe&MessageSid=...
export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const form = new URLSearchParams(rawBody)
  const params = Object.fromEntries(form.entries())

  let verified = false
  try {
    verified = verifyTwilioSignature(request.url, params, request.headers.get("x-twilio-signature"))
  } catch (err) {
    console.error("whatsapp webhook: signature verification misconfigured", err)
  }
  if (!verified) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  // Always ack 200 past this point — Twilio retries webhooks that don't
  // return success, even for messages we can't otherwise handle.
  try {
    const from = params.From?.replace(/^whatsapp:/, "")
    const body = params.Body?.trim()
    if (!from || !body) {
      return NextResponse.json({ received: true })
    }

    const phone = normalizeNigerianPhone(from)
    const user = await prisma.user.findUnique({ where: { phone } })

    if (!user) {
      await sendWhatsAppText(
        from,
        "I don't have a Duelite account for this number yet. Sign up at the Duelite web app first, then message me again."
      )
      return NextResponse.json({ received: true })
    }

    const { reply } = await runDuey({ user, channel: "WHATSAPP", incomingMessage: body })
    await sendWhatsAppText(from, reply)
  } catch (err) {
    console.error("whatsapp webhook: failed to process message", err)
  }

  return NextResponse.json({ received: true })
}
