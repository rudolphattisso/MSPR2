import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

// Vérification des identifiants — réutilise la table `users` (seedée) et bcrypt.
// Appelée par le provider Credentials de NextAuth côté app-siege (Bloc 6).
// Ne renvoie JAMAIS le hash du mot de passe.
export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 })
  }

  const { email, password } = (body ?? {}) as {
    email?: string
    password?: string
  }

  if (!email || !password) {
    return NextResponse.json(
      { error: "email et password requis" },
      { status: 400 },
    )
  }

  const user = await prisma.user.findUnique({ where: { email } })

  // Message générique identique si l'email n'existe pas OU si le mot de passe
  // est faux — évite l'énumération de comptes (OWASP API Security).
  const invalid = NextResponse.json(
    { error: "Identifiants invalides" },
    { status: 401 },
  )
  if (!user) return invalid

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return invalid

  // Mot de passe correct mais email non confirmé → 403 dédié.
  // Vérifié APRÈS le mot de passe : on ne révèle l'état "non vérifié"
  // qu'à quelqu'un qui connaît déjà le mot de passe (anti-énumération).
  if (!user.emailVerified) {
    return NextResponse.json(
      { error: "Email non vérifié", code: "email_not_verified" },
      { status: 403 },
    )
  }

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    countryId: user.countryId,
  })
}
