import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { sendVerificationEmail } from "@/lib/email"

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000 // 24 h

// Pays autorisés (codes de la table countries seedée).
const ALLOWED_COUNTRIES = ["BR", "EC", "CO"]

// Inscription publique. Le rôle est TOUJOURS forcé à VIEWER côté serveur :
// impossible de s'auto-attribuer ADMIN/MANAGER (anti-élévation de privilèges,
// OWASP API Security). Un ADMIN promeut ensuite si besoin.
export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 })
  }

  const { name, email, password, countryId } = (body ?? {}) as {
    name?: string
    email?: string
    password?: string
    countryId?: string | null
  }

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "name, email et password requis" },
      { status: 400 },
    )
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Le mot de passe doit faire au moins 8 caractères" },
      { status: 400 },
    )
  }
  if (countryId != null && countryId !== "" && !ALLOWED_COUNTRIES.includes(countryId)) {
    return NextResponse.json({ error: "Pays invalide" }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json(
      { error: "Cet email est déjà utilisé" },
      { status: 409 },
    )
  }

  const hashed = await bcrypt.hash(password, 10)
  await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      role: "VIEWER", // forcé — jamais lu depuis la requête
      countryId: countryId ? countryId : null,
      // emailVerified reste null → compte inactif tant que non confirmé
    },
  })

  // Jeton de vérification à usage unique (24 h).
  const token = crypto.randomBytes(32).toString("hex")
  await prisma.verificationToken.create({
    data: { token, email, expiresAt: new Date(Date.now() + TOKEN_TTL_MS) },
  })

  // Envoi du mail. Si l'envoi échoue, l'inscription échoue (compte créé mais
  // pas de mail = impasse) → on remonte une 502.
  try {
    await sendVerificationEmail(email, token)
  } catch (e) {
    console.error("[register] échec envoi email de vérification:", e)
    return NextResponse.json(
      { error: "Compte créé mais l'email de vérification n'a pas pu être envoyé" },
      { status: 502 },
    )
  }

  return NextResponse.json(
    { email, requiresVerification: true },
    { status: 201 },
  )
}
