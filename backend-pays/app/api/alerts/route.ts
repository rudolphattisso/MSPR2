import { NextRequest, NextResponse } from "next/server"
import { AlertType, LotStatus } from "@/app/generated/prisma/client"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lotId = searchParams.get("lotId") ?? undefined
  const isResolvedParam = searchParams.get("isResolved")
  const isResolved =
    isResolvedParam === "true"
      ? true
      : isResolvedParam === "false"
        ? false
        : undefined

  const alerts = await prisma.alert.findMany({
    where: {
      ...(lotId ? { lotId } : {}),
      ...(isResolved !== undefined ? { isResolved } : {}),
    },
    include: {
      lot: { include: { warehouse: { include: { country: true } } } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(alerts)
}

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Corps de requête JSON invalide" }, { status: 400 })
  }

  const { lotId, type, message } = body as Record<string, unknown>

  if (typeof lotId !== "string" || typeof type !== "string" || typeof message !== "string") {
    return NextResponse.json(
      { error: "Champs requis manquants : lotId, type, message" },
      { status: 400 }
    )
  }

  if (!Object.values(AlertType).includes(type as AlertType)) {
    return NextResponse.json(
      { error: `Type d'alerte invalide. Valeurs acceptées : ${Object.values(AlertType).join(", ")}` },
      { status: 400 }
    )
  }

  const lot = await prisma.lot.findUnique({ where: { id: lotId } })
  if (!lot) {
    return NextResponse.json({ error: "Lot introuvable" }, { status: 404 })
  }

  const newStatus =
    type === AlertType.PEREMPTION ? LotStatus.PERIME : LotStatus.EN_ALERTE

  const alert = await prisma.$transaction(async (tx) => {
    const created = await tx.alert.create({
      data: { lotId, type: type as AlertType, message },
    })
    if (lot.status !== LotStatus.PERIME) {
      await tx.lot.update({
        where: { id: lotId },
        data: { status: newStatus },
      })
    }
    return created
  })

  return NextResponse.json(alert, { status: 201 })
}
