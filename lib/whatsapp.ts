// Outbound WhatsApp send, bridged through the always-on Baileys worker
// (worker/whatsapp-bot.ts) that holds the actual WhatsApp session — this
// process (a Vercel serverless function) has no live connection of its own.

function getConfig() {
  const url = process.env.WHATSAPP_WORKER_URL
  const secret = process.env.WHATSAPP_WORKER_SECRET
  if (!url) throw new Error("WHATSAPP_WORKER_URL is not set")
  if (!secret) throw new Error("WHATSAPP_WORKER_SECRET is not set")
  return { url, secret }
}

// `to` is E.164 with a leading "+" (e.g. "+2348012345678") — same format
// User.phone is stored in.
export async function sendWhatsAppText(to: string, body: string): Promise<void> {
  const { url, secret } = getConfig()

  const res = await fetch(`${url.replace(/\/$/, "")}/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-worker-secret": secret },
    body: JSON.stringify({ to, text: body }),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => "")
    throw new Error(`WhatsApp worker responded ${res.status}${detail ? `: ${detail}` : ""}`)
  }
}
