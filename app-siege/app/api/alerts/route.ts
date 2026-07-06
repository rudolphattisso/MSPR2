import { NextRequest, NextResponse } from "next/server"
import { getAlerts } from "@/lib/backend"

// Agrégateur siège : alertes, filtrées selon le rôle / le pays demandé.
export async function GET(req: NextRequest) {
  const country = new URL(req.url).searchParams.get("country")
  return NextResponse.json(await getAlerts(country))
}
