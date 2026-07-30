// Always-on process that holds the actual WhatsApp session for Duey.
// Doesn't run on Vercel (serverless functions can't hold a persistent
// connection) — deploy this separately (see worker/Dockerfile) to a
// long-running host (Railway/Fly/a VPS).
//
// First run: scan the printed QR code with the WhatsApp account for
// 09027571545 (WhatsApp > Linked Devices > Link a Device). The session is
// then persisted to Mongo (see mongo-auth-state.ts) so restarts don't need a
// re-scan.
//
// Inbound: listens for messages, runs them through Duey, replies on the same
// socket. Outbound: exposes a small internal HTTP endpoint (POST /send) so
// the main Next.js app — which holds no WhatsApp connection of its own — can
// push proactive messages (payment receipts, anomaly alerts) through here.

import "dotenv/config"
import http from "node:http"

import makeWASocket, { DisconnectReason, fetchLatestBaileysVersion } from "baileys"
import pino from "pino"
import qrcode from "qrcode-terminal"

import { prisma } from "../lib/prisma"
import { runDuey } from "../lib/duey/run"
import { normalizeNigerianPhone } from "../lib/identifiers"
import { loadMongoAuthState } from "./mongo-auth-state"

const logger = pino({ level: process.env.LOG_LEVEL ?? "info" })

type Socket = ReturnType<typeof makeWASocket>
let sock: Socket | null = null

function toJid(phone: string): string {
  return `${phone.replace(/^\+/, "")}@s.whatsapp.net`
}

function fromJid(jid: string): string {
  const digits = jid.split("@")[0].split(":")[0]
  return normalizeNigerianPhone(digits)
}

async function connect() {
  const { state, saveCreds } = await loadMongoAuthState()
  const { version } = await fetchLatestBaileysVersion()

  sock = makeWASocket({
    version,
    auth: state,
    logger,
    printQRInTerminal: false,
  })

  sock.ev.on("creds.update", saveCreds)

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      console.log("\nScan this QR with the WhatsApp account for 09027571545 (Linked Devices > Link a Device):\n")
      qrcode.generate(qr, { small: true })
    }

    if (connection === "close") {
      const statusCode = (lastDisconnect?.error as { output?: { statusCode?: number } } | undefined)?.output
        ?.statusCode
      const loggedOut = statusCode === DisconnectReason.loggedOut
      logger.warn({ statusCode, loggedOut }, "WhatsApp connection closed")
      if (!loggedOut) {
        connect().catch((err) => logger.error(err, "Reconnect failed"))
      } else {
        logger.error("Logged out — clear the WhatsAppAuthKey collection and re-scan the QR to relink.")
      }
    } else if (connection === "open") {
      logger.info("WhatsApp connected")
    }
  })

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return

    for (const msg of messages) {
      if (msg.key.fromMe) continue
      const jid = msg.key.remoteJid
      if (!jid || jid.endsWith("@g.us") || jid === "status@broadcast") continue

      const body = msg.message?.conversation ?? msg.message?.extendedTextMessage?.text ?? ""
      if (!body.trim()) continue

      try {
        // WhatsApp has been migrating chats to privacy-preserving LID
        // addressing, where remoteJid is an opaque "<id>@lid" instead of
        // the phone-number JID — senderPn carries the real phone-number
        // JID alongside it when that happens. Falling back to a bare
        // fromJid(jid) here silently mismatches real accounts, since the
        // LID digits never match anything stored in User.phone.
        const phone = fromJid(msg.key.senderPn ?? jid)
        const user = await prisma.user.findUnique({ where: { phone } })

        if (!user) {
          await sock!.sendMessage(jid, {
            text: "I don't have a Duelite account for this number yet. Sign up at the Duelite web app first, then message me again.",
          })
          continue
        }

        const { reply } = await runDuey({ user, channel: "WHATSAPP", incomingMessage: body.trim() })
        await sock!.sendMessage(jid, { text: reply })
      } catch (err) {
        logger.error(err, "Failed to handle inbound WhatsApp message")
        // Without this, a transient failure (e.g. the AI proxy's DNS
        // hiccupping) drops the user's message with no reply at all, which
        // is indistinguishable from the bot being broken.
        try {
          await sock!.sendMessage(jid, {
            text: "Sorry, I'm having trouble reaching the AI right now — try again in a bit.",
          })
        } catch (sendErr) {
          logger.error(sendErr, "Failed to send failure notice to user")
        }
      }
    }
  })
}

// Internal bridge: the Next.js app calls this to send a message through the
// one live WhatsApp session this process owns.
function startOutboundServer() {
  const port = Number(process.env.PORT ?? 8787)
  const secret = process.env.WHATSAPP_WORKER_SECRET

  const server = http.createServer((req, res) => {
    if (req.method !== "POST" || req.url !== "/send") {
      res.writeHead(404).end()
      return
    }
    if (!secret || req.headers["x-worker-secret"] !== secret) {
      res.writeHead(401).end()
      return
    }

    let raw = ""
    req.on("data", (chunk) => (raw += chunk))
    req.on("end", async () => {
      try {
        const { to, text } = JSON.parse(raw || "{}")
        if (!to || !text || !sock) {
          res.writeHead(400, { "Content-Type": "application/json" })
          res.end(JSON.stringify({ error: "Missing to/text, or socket not ready" }))
          return
        }
        await sock.sendMessage(toJid(normalizeNigerianPhone(String(to))), { text: String(text) })
        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ ok: true }))
      } catch (err) {
        logger.error(err, "Failed to send outbound WhatsApp message")
        res.writeHead(500, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ error: "Send failed" }))
      }
    })
  })

  server.listen(port, () => logger.info(`Outbound WhatsApp bridge listening on :${port}`))
}

connect().catch((err) => {
  logger.error(err, "Failed to start WhatsApp connection")
  process.exit(1)
})
startOutboundServer()
