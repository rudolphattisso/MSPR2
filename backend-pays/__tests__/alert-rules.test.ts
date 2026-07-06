import { describe, it, expect, beforeEach } from "vitest"
import { prisma } from "../lib/prisma.js"
import { checkMeasurementAlerts, checkLotExpiration } from "../lib/alert-rules.js"

const warehouseId = "00000000-0000-0000-0000-000000000001"

async function createLot(reference: string, storedAt?: Date) {
  return prisma.lot.create({
    data: {
      reference,
      warehouseId,
      storedAt: storedAt ?? new Date(),
    },
  })
}

describe("alert-rules", () => {
  beforeEach(async () => {
    await prisma.alert.deleteMany()
    await prisma.lot.deleteMany()
  })

  it("should create a temperature alert and update lot status", async () => {
    const lot = await createLot("LOT-TEST-1")

    await checkMeasurementAlerts(warehouseId, 35, 55)

    const alerts = await prisma.alert.findMany({ where: { lotId: lot.id } })
    expect(alerts.length).toBe(1)
    expect(alerts[0].type).toBe("SEUIL_TEMPERATURE")

    const updatedLot = await prisma.lot.findUnique({ where: { id: lot.id } })
    expect(updatedLot?.status).toBe("EN_ALERTE")
  })

  it("should not create alerts when measurements are inside thresholds", async () => {
    await createLot("LOT-TEST-2")

    await checkMeasurementAlerts(warehouseId, 29, 55)

    const alerts = await prisma.alert.findMany()
    expect(alerts.length).toBe(0)
  })

  it("should create a peremption alert when lot is too old", async () => {
    const oldDate = new Date(Date.now() - 366 * 24 * 60 * 60 * 1000)
    const lot = await createLot("LOT-TEST-3", oldDate)

    await checkLotExpiration(lot.id)

    const alert = await prisma.alert.findFirst({ where: { lotId: lot.id } })
    expect(alert).not.toBeNull()
    expect(alert?.type).toBe("PEREMPTION")

    const updatedLot = await prisma.lot.findUnique({ where: { id: lot.id } })
    expect(updatedLot?.status).toBe("PERIME")
  })
})
