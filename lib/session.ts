import { cookies } from "next/headers"

import { SESSION_COOKIE_NAME, SESSION_DURATION, signSessionToken, verifySessionToken } from "@/lib/jwt"

export { verifySessionToken, SESSION_COOKIE_NAME }

export async function createSession(userId: string) {
  const token = await signSessionToken(userId)
  const store = await cookies()
  store.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION,
  })
}

export async function getSession(): Promise<{ userId: string } | null> {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE_NAME)?.value
  if (!token) return null
  return verifySessionToken(token)
}

export async function destroySession() {
  const store = await cookies()
  store.delete(SESSION_COOKIE_NAME)
}
