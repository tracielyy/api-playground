export { default } from "next-auth/middleware"

export const config = {
  matcher: [
    "/api/proxy",   // protect proxy endpoint
    "/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)", // protect all pages except login
  ],
}
