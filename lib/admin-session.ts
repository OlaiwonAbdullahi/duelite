import { cookies } from "next/headers"

const ADMIN_COOKIE_NAME = "admin_secret"
const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 12 // 12 hours

export function checkAdminSecret(secret: string): boolean {
  return Boolean(process.env.ADMIN_SECRET) && secret === process.env.ADMIN_SECRET
}

export async function createAdminSession(secret: string) {
  const store = await cookies()
  store.set(ADMIN_COOKIE_NAME, secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_COOKIE_MAX_AGE,
  })
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies()
  const value = store.get(ADMIN_COOKIE_NAME)?.value
  return Boolean(value) && checkAdminSecret(value!)
}

export async function destroyAdminSession() {
  const store = await cookies()
  store.delete(ADMIN_COOKIE_NAME)
}
