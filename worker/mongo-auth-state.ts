// Same shape as Baileys' own useMultiFileAuthState (see
// node_modules/baileys/lib/Utils/use-multi-file-auth-state.js) but backed by
// Mongo via Prisma instead of local files — so the worker can redeploy on a
// host with an ephemeral filesystem (Railway/Fly) without losing the linked
// WhatsApp session and forcing a re-scan of the QR code.

import { proto, initAuthCreds, BufferJSON } from "baileys"
import type { AuthenticationState, SignalDataTypeMap } from "baileys"

import { prisma } from "../lib/prisma"

async function readKey(id: string): Promise<unknown | null> {
  const row = await prisma.whatsAppAuthKey.findUnique({ where: { id } })
  if (!row) return null
  return JSON.parse(row.value, BufferJSON.reviver)
}

async function writeKey(id: string, value: unknown): Promise<void> {
  const serialized = JSON.stringify(value, BufferJSON.replacer)
  await prisma.whatsAppAuthKey.upsert({
    where: { id },
    create: { id, value: serialized },
    update: { value: serialized },
  })
}

async function removeKey(id: string): Promise<void> {
  await prisma.whatsAppAuthKey.deleteMany({ where: { id } })
}

export async function loadMongoAuthState(): Promise<{
  state: AuthenticationState
  saveCreds: () => Promise<void>
}> {
  const creds = (await readKey("creds")) ?? initAuthCreds()

  return {
    state: {
      creds: creds as AuthenticationState["creds"],
      keys: {
        get: async <T extends keyof SignalDataTypeMap>(type: T, ids: string[]) => {
          const data: { [id: string]: SignalDataTypeMap[T] } = {}
          await Promise.all(
            ids.map(async (id) => {
              let value = await readKey(`${type}-${id}`)
              if (type === "app-state-sync-key" && value) {
                value = proto.Message.AppStateSyncKeyData.fromObject(value)
              }
              data[id] = value as SignalDataTypeMap[T]
            })
          )
          return data
        },
        set: async (data) => {
          const tasks: Promise<void>[] = []
          for (const category in data) {
            for (const id in data[category as keyof typeof data]) {
              const value = data[category as keyof typeof data]?.[id]
              const key = `${category}-${id}`
              tasks.push(value ? writeKey(key, value) : removeKey(key))
            }
          }
          await Promise.all(tasks)
        },
      },
    },
    saveCreds: async () => {
      await writeKey("creds", creds)
    },
  }
}
