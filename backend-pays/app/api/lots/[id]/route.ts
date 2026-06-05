import { NextRequest, NextResponse } from "next/server"
import { LotStatus } from "@/app/generated/prisma/client"
import { prisma } from "@/lib/prisma"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params

  const lot = await prisma.lot.findUnique({
    where: { id },
    include: {
      warehouse: { include: { country: true } },
      alerts: { orderBy: { createdAt: "desc" } },
    },
  })

  if (!lot) return NextResponse.json({ error: "Lot non trouvé" }, { status: 404 })

  return NextResponse.json(lot)
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params
  const body = await req.json()
  const { status, reference } = body

  if (status && !Object.values(LotStatus).includes(status)) {
    return NextResponse.json({ error: "Statut invalide" }, { status: 400 })
  }

  const lot = await prisma.lot.update({
    where: { id },
    data: {
      ...(status ? { status } : {}),
      ...(reference ? { reference } : {}),
    },
    include: { warehouse: { include: { country: true } } },
  })

  return NextResponse.json(lot)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params

  await prisma.lot.delete({ where: { id } })

  return new NextResponse(null, { status: 204 })
}
