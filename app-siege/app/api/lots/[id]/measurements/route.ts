import { NextRequest, NextResponse } from "next/server"
import { getLotDetail, getMeasurements } from "@/lib/backend"

// Agrégateur siège : mesures (temp/humidité) d'un lot, pour les courbes.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const lot = await getLotDetail(id)
  if (!lot) {
    return NextResponse.json({ error: "Lot introuvable" }, { status: 404 })
  }
  return NextResponse.json(await getMeasurements(id))
}
