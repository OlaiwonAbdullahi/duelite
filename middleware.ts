import { NextRequest, NextResponse } from "next/server"

import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/jwt"

const PROTECTED_PREFIXES = ["/dashboard", "/rep"]
const AUTH_PAGES = ["/login", "/signup"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value
  const session = token ? await verifySessionToken(token) : null

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  if (isProtected && !session) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  const isAuthPage = AUTH_PAGES.some((page) => pathname.startsWith(page))
  if (isAuthPage && session) {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/rep/:path*", "/login", "/signup"],
}
