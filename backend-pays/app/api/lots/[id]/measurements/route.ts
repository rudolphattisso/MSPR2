import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

type Params = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params
  const { searchParams } = new URL(req.url)
  const from = searchParams.get("from")
  const to = searchParams.get("to")
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "100"), 1000)

  const lot = await prisma.lot.findUnique({
    where: { id },
    select: { warehouseId: true },
  })

  if (!lot) return NextResponse.json({ error: "Lot non trouvé" }, { status: 404 })

  const measurements = await prisma.measurement.findMany({
    where: {
      warehouseId: lot.warehouseId,
      ...(from || to
        ? {
            recordedAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
    },
    orderBy: { recordedAt: "desc" },
    take: limit,
  })

  return NextResponse.json(measurements)
}
