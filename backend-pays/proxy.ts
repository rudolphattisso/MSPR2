import { NextRequest, NextResponse } from "next/server"

const SERVICE_API_KEY = process.env.SERVICE_API_KEY

// Couche 2 d'authentification (machine-à-machine).
// Toutes les routes /api/* du backend pays ne sont appelées que par app-siege
// (l'agrégateur siège). On exige une clé de service partagée dans l'en-tête
// x-api-key — sinon 401. Empêche tout accès direct non autorisé à l'API pays
// (OWASP API Security : "Broken Authentication").
export default function proxy(req: NextRequest) {
  const key = req.headers.get("x-api-key")
  if (!SERVICE_API_KEY || key !== SERVICE_API_KEY) {
    return NextResponse.json(
      { error: "Clé de service invalide ou manquante" },
      { status: 401 },
    )
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/api/:path*"],
}
