// WhatsApp via Twilio's WhatsApp API (Account SID + Auth Token + a
// WhatsApp-enabled Twilio number). Docs: https://www.twilio.com/docs/whatsapp

import twilio from "twilio"

function getConfig() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_WHATSAPP_FROM
  if (!accountSid) throw new Error("TWILIO_ACCOUNT_SID is not set")
  if (!authToken) throw new Error("TWILIO_AUTH_TOKEN is not set")
  if (!from) throw new Error("TWILIO_WHATSAPP_FROM is not set")
  return { accountSid, authToken, from }
}

// `to` is E.164 with a leading "+" (e.g. "+2348012345678") — same format
// User.phone is stored in.
export async function sendWhatsAppText(to: string, body: string): Promise<void> {
  const { accountSid, authToken, from } = getConfig()
  const client = twilio(accountSid, authToken)

  await client.messages.create({
    from: `whatsapp:${from}`,
    to: `whatsapp:${to}`,
    body,
  })
}

// Twilio signs each webhook request with the full public URL + sorted form
// params (see twilio.validateRequest docs). `url` must be the exact URL
// Twilio POSTed to — if this app runs behind a proxy/tunnel that rewrites
// the host, request.url won't match what Twilio signed and this will fail;
// override with an explicit public URL in that case.
export function verifyTwilioSignature(
  url: string,
  params: Record<string, string>,
  signatureHeader: string | null
): boolean {
  const authToken = process.env.TWILIO_AUTH_TOKEN
  if (!authToken) throw new Error("TWILIO_AUTH_TOKEN is not set")
  if (!signatureHeader) return false

  return twilio.validateRequest(authToken, signatureHeader, url, params)
}
