import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  // Public routes — always accessible
  const publicRoutes = ["/", "/auth/signin", "/auth/signup", "/auth/error"]
  if (publicRoutes.some((r) => pathname === r || pathname.startsWith("/api/auth"))) {
    return NextResponse.next()
  }

  // Redirect to sign-in if not authenticated
  if (!isLoggedIn) {
    const signInUrl = new URL("/auth/signin", req.url)
    signInUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg).*)"],
}
