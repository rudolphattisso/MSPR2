import { describe, it, expect, beforeEach } from "vitest"
import { prisma } from "../lib/prisma.js"
import { POST as createLotHandler, GET as listLotsHandler } from "../app/api/lots/route"
import { NextRequest } from "next/server"

// Utilise NextRequest pour correspondre aux attentes des routes Next.js API
const makeRequest = (url: string, body: unknown) =>
  new NextRequest(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

async function parseJson(response: Response) {
  return response.json()
}

describe("lots API", () => {
  beforeEach(async () => {
    await prisma.lot.deleteMany()
  })

  it("should create a lot and return it", async () => {
    const warehouseId = "00000000-0000-0000-0000-000000000001"
    const req = makeRequest("http://localhost/api/lots", { reference: "TEST-LOT-123", warehouseId })
    const response = await createLotHandler(req)

    expect(response.status).toBe(201)
    const data = await parseJson(response)
    expect(data.reference).toBe("TEST-LOT-123")
    expect(data.warehouseId).toBe(warehouseId)
  })

  it("should list lots with filter parameters", async () => {
    const warehouseId = "00000000-0000-0000-0000-000000000001"
    await prisma.lot.create({
      data: { reference: "FILTER-LOT-001", warehouseId },
    })

    const response = await listLotsHandler(
      new NextRequest(`http://localhost/api/lots?warehouseId=${warehouseId}`),
    )
    expect(response.status).toBe(200)
    const data = await parseJson(response)
    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBeGreaterThanOrEqual(1)
  })
})