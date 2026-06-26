import { NextRequest, NextResponse } from "next/server"
import { getLotDetail } from "@/lib/backend"

// Agrégateur siège : détail d'un lot (autorisation par rôle dans le helper).
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const lot = await getLotDetail(id)
  if (!lot) {
    return NextResponse.json({ error: "Lot introuvable" }, { status: 404 })
  }
  return NextResponse.json(lot)
}
