// Edge-safe JWT helpers — no next/headers import, so middleware.ts (which
// runs on the Edge runtime) can use verifySessionToken() directly against
// NextRequest's cookies without pulling in server-only APIs.
import { SignJWT, jwtVerify } from "jose"

export const SESSION_COOKIE_NAME = "duelite_session"
export const SESSION_DURATION = 60 * 60 * 24 * 30 // 30 days, in seconds

function getSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error("JWT_SECRET is not set")
  return new TextEncoder().encode(secret)
}

export async function signSessionToken(userId: string) {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(getSecret())
}

export async function verifySessionToken(token: string): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    if (typeof payload.userId !== "string") return null
    return { userId: payload.userId }
  } catch {
    return null
  }
}
