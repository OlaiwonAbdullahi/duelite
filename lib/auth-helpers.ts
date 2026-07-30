import bcrypt from "bcryptjs"

import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

// Loads the full User row for the current session, or null if unauthenticated.
export async function getCurrentUser() {
  const session = await getSession()
  if (!session) return null
  return prisma.user.findUnique({ where: { id: session.userId } })
}
