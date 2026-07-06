import { describe, it, expect } from "vitest"
import { GET as getWarehousesHandler } from "../app/api/warehouses/route"
import { GET as getAlertsHandler, POST as postAlertHandler } from "../app/api/alerts/route"
import { POST as postMeasurementHandler } from "../app/api/measurements/route"
import { GET as getLotHandler, PATCH as patchLotHandler, DELETE as deleteLotHandler } from "../app/api/lots/[id]/route"
import { GET as getLotMeasurementsHandler } from "../app/api/lots/[id]/measurements/route"
import { NextRequest } from "next/server"
import { prisma } from "../lib/prisma"

const warehouseId = "00000000-0000-0000-0000-000000000001" // Sao Paulo (Brésil)

const makeRequest = (url: string, body?: unknown, method = "POST") =>
  new NextRequest(url, {
    method,
    headers: { "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })

async function parseJson(response: Response) {
  return response.json()
}

describe("Additional API Routes", () => {
  it("GET /api/warehouses - should return list of warehouses", async () => {
    const req = makeRequest("http://localhost/api/warehouses", undefined, "GET")
    const response = await getWarehousesHandler(req)
    expect(response.status).toBe(200)
    const data = await parseJson(response)
    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBeGreaterThan(0)
    expect(data[0]).toHaveProperty("country")
  })

  it("GET /api/warehouses?countryId=BR - should return warehouses filtered by country", async () => {
    const req = makeRequest("http://localhost/api/warehouses?countryId=BR", undefined, "GET")
    const response = await getWarehousesHandler(req)
    expect(response.status).toBe(200)
    const data = await parseJson(response)
    expect(Array.isArray(data)).toBe(true)
    expect(data.every((w: any) => w.countryId === "BR")).toBe(true)
  })

  it("POST /api/alerts - should create an alert and update lot status", async () => {
    const lot = await prisma.lot.create({
      data: { reference: "ALERT-TEST-LOT", warehouseId },
    })

    const req = makeRequest("http://localhost/api/alerts", {
      lotId: lot.id,
      type: "SEUIL_TEMPERATURE",
      message: "Test temperature high",
    })

    const response = await postAlertHandler(req)
    expect(response.status).toBe(201)
    const data = await parseJson(response)
    expect(data).toHaveProperty("id")
    expect(data.lotId).toBe(lot.id)
    expect(data.type).toBe("SEUIL_TEMPERATURE")

    const updatedLot = await prisma.lot.findUnique({ where: { id: lot.id } })
    expect(updatedLot?.status).toBe("EN_ALERTE")
  })

  it("POST /api/alerts - should return 400 if fields are missing", async () => {
    const req = makeRequest("http://localhost/api/alerts", {
      lotId: "invalid",
    })
    const response = await postAlertHandler(req)
    expect(response.status).toBe(400)
  })

  it("POST /api/alerts - should return 400 if type is invalid", async () => {
    const req = makeRequest("http://localhost/api/alerts", {
      lotId: "invalid",
      type: "INVALID_TYPE",
      message: "test",
    })
    const response = await postAlertHandler(req)
    expect(response.status).toBe(400)
  })

  it("POST /api/alerts - should return 404 if lot is not found", async () => {
    const req = makeRequest("http://localhost/api/alerts", {
      lotId: "00000000-0000-0000-0000-000000009999",
      type: "SEUIL_TEMPERATURE",
      message: "test",
    })
    const response = await postAlertHandler(req)
    expect(response.status).toBe(404)
  })

  it("GET /api/alerts - should list alerts", async () => {
    const lot = await prisma.lot.create({
      data: { reference: "ALERT-GET-LOT", warehouseId },
    })
    await prisma.alert.create({
      data: { lotId: lot.id, type: "SEUIL_TEMPERATURE", message: "test alert" },
    })

    const req = makeRequest(`http://localhost/api/alerts?lotId=${lot.id}`, undefined, "GET")
    const response = await getAlertsHandler(req)
    expect(response.status).toBe(200)
    const data = await parseJson(response)
    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBe(1)
    expect(data[0].lotId).toBe(lot.id)
  })

  it("POST /api/measurements - should create a measurement", async () => {
    const req = makeRequest("http://localhost/api/measurements", {
      warehouseId,
      temperature: 30,
      humidity: 50,
      recordedAt: new Date().toISOString(),
    })
    const response = await postMeasurementHandler(req)
    expect(response.status).toBe(201)
    const data = await parseJson(response)
    expect(data.warehouseId).toBe(warehouseId)
    expect(data.temperature).toBe(30)
  })

  it("POST /api/measurements - should return 400 if fields are missing", async () => {
    const req = makeRequest("http://localhost/api/measurements", {
      warehouseId,
    })
    const response = await postMeasurementHandler(req)
    expect(response.status).toBe(400)
  })

  it("GET /api/lots/[id] - should fetch lot details, return 404 if not found", async () => {
    const lot = await prisma.lot.create({
      data: { reference: "LOT-DETAILS-TEST", warehouseId },
    })

    const reqGet = makeRequest(`http://localhost/api/lots/${lot.id}`, undefined, "GET")
    const responseGet = await getLotHandler(reqGet, { params: Promise.resolve({ id: lot.id }) })
    expect(responseGet.status).toBe(200)
    const dataGet = await parseJson(responseGet)
    expect(dataGet.reference).toBe("LOT-DETAILS-TEST")

    const responseNotFound = await getLotHandler(reqGet, { params: Promise.resolve({ id: "00000000-0000-0000-0000-000000009999" }) })
    expect(responseNotFound.status).toBe(404)
  })

  it("PATCH /api/lots/[id] - should update lot details", async () => {
    const lot = await prisma.lot.create({
      data: { reference: "LOT-PATCH-TEST", warehouseId },
    })

    const reqPatch = makeRequest(`http://localhost/api/lots/${lot.id}`, {
      reference: "LOT-PATCH-UPDATED",
      status: "PERIME",
    }, "PATCH")

    const responsePatch = await patchLotHandler(reqPatch, { params: Promise.resolve({ id: lot.id }) })
    expect(responsePatch.status).toBe(200)
    const dataPatch = await parseJson(responsePatch)
    expect(dataPatch.reference).toBe("LOT-PATCH-UPDATED")
    expect(dataPatch.status).toBe("PERIME")
  })

  it("PATCH /api/lots/[id] - should return 400 for invalid status", async () => {
    const lot = await prisma.lot.create({
      data: { reference: "LOT-PATCH-INVALID", warehouseId },
    })

    const reqPatch = makeRequest(`http://localhost/api/lots/${lot.id}`, {
      status: "INVALID_STATUS",
    }, "PATCH")

    const responsePatch = await patchLotHandler(reqPatch, { params: Promise.resolve({ id: lot.id }) })
    expect(responsePatch.status).toBe(400)
  })

  it("DELETE /api/lots/[id] - should delete a lot", async () => {
    const lot = await prisma.lot.create({
      data: { reference: "LOT-DELETE-TEST", warehouseId },
    })

    const reqDelete = makeRequest(`http://localhost/api/lots/${lot.id}`, undefined, "DELETE")
    const responseDelete = await deleteLotHandler(reqDelete, { params: Promise.resolve({ id: lot.id }) })
    expect(responseDelete.status).toBe(204)

    const checkLot = await prisma.lot.findUnique({ where: { id: lot.id } })
    expect(checkLot).toBeNull()
  })

  it("GET /api/lots/[id]/measurements - should get measurements of lot warehouse, return 404 if lot not found", async () => {
    const lot = await prisma.lot.create({
      data: { reference: "LOT-MEASUREMENTS-TEST", warehouseId },
    })
    await prisma.measurement.create({
      data: { warehouseId, temperature: 25, humidity: 60 },
    })

    const reqGet = makeRequest(`http://localhost/api/lots/${lot.id}/measurements`, undefined, "GET")
    const responseGet = await getLotMeasurementsHandler(reqGet, { params: Promise.resolve({ id: lot.id }) })
    expect(responseGet.status).toBe(200)
    const dataGet = await parseJson(responseGet)
    expect(Array.isArray(dataGet)).toBe(true)
    expect(dataGet.length).toBeGreaterThan(0)

    const responseNotFound = await getLotMeasurementsHandler(reqGet, { params: Promise.resolve({ id: "00000000-0000-0000-0000-000000009999" }) })
    expect(responseNotFound.status).toBe(404)
  })
})
