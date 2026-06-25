import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Valide un token de vérification : marque l'email comme vérifié, consomme le
// token. Appelée par la page /verify d'app-siege (qui porte la clé de service).
export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get("token")
  if (!token) {
    return NextResponse.json({ error: "Token manquant" }, { status: 400 })
  }

  const record = await prisma.verificationToken.findUnique({ where: { token } })
  if (!record) {
    return NextResponse.json({ error: "Token invalide" }, { status: 400 })
  }

  if (record.expiresAt < new Date()) {
    await prisma.verificationToken.delete({ where: { token } })
    return NextResponse.json({ error: "Token expiré" }, { status: 410 })
  }

  await prisma.user.update({
    where: { email: record.email },
    data: { emailVerified: new Date() },
  })
  await prisma.verificationToken.delete({ where: { token } })

  return NextResponse.json({ verified: true, email: record.email })
}
