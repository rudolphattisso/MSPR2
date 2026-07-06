import { NextRequest, NextResponse } from "next/server"
import { getLots } from "@/lib/backend"

// Agrégateur siège : lots, filtrés (pays/entrepôt) + triés FIFO.
export async function GET(req: NextRequest) {
  const params = new URL(req.url).searchParams
  return NextResponse.json(
    await getLots({
      country: params.get("country"),
      warehouse: params.get("warehouse"),
    }),
  )
}
