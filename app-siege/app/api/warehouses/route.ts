import { NextRequest, NextResponse } from "next/server"
import { getWarehouses } from "@/lib/backend"

// Agrégateur siège : entrepôts, filtrés selon le rôle.
export async function GET(req: NextRequest) {
  const country = new URL(req.url).searchParams.get("country")
  return NextResponse.json(await getWarehouses(country))
}
