import { auth } from "@/auth"
import { NextResponse } from "next/server"

// Routes accessibles sans être connecté.
const PUBLIC_ROUTES = ["/login", "/register", "/verify"]

// Middleware global : protège toutes les pages/routes sauf les publiques et
// /api/auth/* (exclu via le matcher, géré par NextAuth lui-même).
export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const isPublic = PUBLIC_ROUTES.some((p) => nextUrl.pathname.startsWith(p))

  // Non connecté sur une route protégée → login.
  if (!isLoggedIn && !isPublic) {
    return NextResponse.redirect(new URL("/login", nextUrl))
  }

  // Déjà connecté mais sur login/register → accueil.
  if (isLoggedIn && isPublic) {
    return NextResponse.redirect(new URL("/", nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  // Exclut : routes NextAuth, assets Next, favicon.
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
}
