import { NextRequest, NextResponse } from "next/server"
import { checkMeasurementAlerts } from "@/lib/alert-rules"
import { prisma } from "@/lib/prisma"

// Liste des mesures (pour l'agrégateur siège : courbes de conditions).
// Filtres optionnels : ?since=<ISO> (mesures récentes), ?warehouseId=<id>.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const since = searchParams.get("since")
  const warehouseId = searchParams.get("warehouseId")

  const measurements = await prisma.measurement.findMany({
    where: {
      ...(since ? { recordedAt: { gte: new Date(since) } } : {}),
      ...(warehouseId ? { warehouseId } : {}),
    },
    orderBy: { recordedAt: "asc" },
  })

  return NextResponse.json(measurements)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { warehouseId, temperature, humidity, recordedAt } = body

  if (!warehouseId || temperature == null || humidity == null) {
    return NextResponse.json(
      { error: "warehouseId, temperature et humidity sont requis" },
      { status: 400 }
    )
  }

  const measurement = await prisma.measurement.create({
    data: {
      warehouseId,
      temperature,
      humidity,
      ...(recordedAt ? { recordedAt: new Date(recordedAt) } : {}),
    },
  })

  // Fire-and-forget : on ne bloque pas la réponse sur la vérification des seuils.
  // En production, remplacer par une job queue pour garantir l'exécution.
  checkMeasurementAlerts(warehouseId, temperature, humidity).catch((err) =>
    console.error("[alert-rules] checkMeasurementAlerts failed:", err)
  )

  return NextResponse.json(measurement, { status: 201 })
}
