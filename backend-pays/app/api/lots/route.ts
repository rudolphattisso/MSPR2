import { NextRequest, NextResponse } from "next/server"
import { LotStatus } from "@/app/generated/prisma/client"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const warehouseId = searchParams.get("warehouseId") ?? undefined
  const status = searchParams.get("status") as LotStatus | null

  const lots = await prisma.lot.findMany({
    where: {
      ...(warehouseId ? { warehouseId } : {}),
      ...(status && Object.values(LotStatus).includes(status) ? { status } : {}),
    },
    include: {
      warehouse: { include: { country: true } },
      _count: { select: { alerts: { where: { isResolved: false } } } },
    },
    orderBy: { storedAt: "asc" }, // FIFO
  })

  return NextResponse.json(lots)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { reference, warehouseId, storedAt } = body

  if (!reference || !warehouseId) {
    return NextResponse.json(
      { error: "reference et warehouseId sont requis" },
      { status: 400 }
    )
  }

  const lot = await prisma.lot.create({
    data: {
      reference,
      warehouseId,
      ...(storedAt ? { storedAt: new Date(storedAt) } : {}),
    },
    include: { warehouse: { include: { country: true } } },
  })

  return NextResponse.json(lot, { status: 201 })
}
