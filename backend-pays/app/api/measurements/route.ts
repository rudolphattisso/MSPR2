import { NextRequest, NextResponse } from "next/server"
import { checkMeasurementAlerts } from "@/lib/alert-rules"
import { prisma } from "@/lib/prisma"

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
