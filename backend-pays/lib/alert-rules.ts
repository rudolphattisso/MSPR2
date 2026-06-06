import { AlertType, LotStatus } from "@/app/generated/prisma/client"
import { prisma } from "@/lib/prisma"

const MS_PER_DAY = 24 * 60 * 60 * 1000
const EXPIRATION_DAYS = 365

export async function checkMeasurementAlerts(
  warehouseId: string,
  temperature: number,
  humidity: number
): Promise<void> {
  const warehouse = await prisma.warehouse.findUnique({
    where: { id: warehouseId },
    include: {
      country: true,
      lots: { where: { status: { not: LotStatus.PERIME } } },
    },
  })

  if (!warehouse || warehouse.lots.length === 0) return

  const { idealTemp, tempTolerance, idealHumidity, humidityTolerance } =
    warehouse.country
  const tempViolation = Math.abs(temperature - idealTemp) > tempTolerance
  const humViolation = Math.abs(humidity - idealHumidity) > humidityTolerance

  if (!tempViolation && !humViolation) return

  for (const lot of warehouse.lots) {
    await prisma.$transaction(async (tx) => {
      if (tempViolation) {
        await tx.alert.create({
          data: {
            lotId: lot.id,
            type: AlertType.SEUIL_TEMPERATURE,
            message: `Température ${temperature}°C hors seuil (idéal : ${idealTemp}°C ±${tempTolerance}°C)`,
          },
        })
      }
      if (humViolation) {
        await tx.alert.create({
          data: {
            lotId: lot.id,
            type: AlertType.SEUIL_HUMIDITE,
            message: `Humidité ${humidity}% hors seuil (idéal : ${idealHumidity}% ±${humidityTolerance}%)`,
          },
        })
      }
      if (lot.status === LotStatus.CONFORME) {
        await tx.lot.update({
          where: { id: lot.id },
          data: { status: LotStatus.EN_ALERTE },
        })
      }
    })
  }
}

export async function checkLotExpiration(lotId: string): Promise<void> {
  const lot = await prisma.lot.findUnique({ where: { id: lotId } })
  if (!lot || lot.status === LotStatus.PERIME) return

  const ageMs = Date.now() - lot.storedAt.getTime()
  if (ageMs < EXPIRATION_DAYS * MS_PER_DAY) return

  const ageDays = Math.floor(ageMs / MS_PER_DAY)
  await prisma.$transaction(async (tx) => {
    await tx.alert.create({
      data: {
        lotId: lot.id,
        type: AlertType.PEREMPTION,
        message: `Lot stocké depuis ${ageDays} jours — seuil de ${EXPIRATION_DAYS} jours dépassé`,
      },
    })
    await tx.lot.update({
      where: { id: lot.id },
      data: { status: LotStatus.PERIME },
    })
  })
}

// Vérifie la péremption de tous les lots non expirés (appelé au démarrage ou à la demande)
export async function checkAllLotExpirations(): Promise<void> {
  const lots = await prisma.lot.findMany({
    where: { status: { not: LotStatus.PERIME } },
    select: { id: true },
  })
  await Promise.all(lots.map((l) => checkLotExpiration(l.id)))
}
