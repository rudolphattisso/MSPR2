import { describe, it, expect, vi, beforeEach, afterAll } from "vitest"
import {
  backendFetch,
  backendFetchFirst,
  aggregateArray,
  getWarehouses,
  getLots,
  getAlerts,
  getLotDetail,
  getMeasurements,
  getLotAlerts,
  getDashboardStats,
  getConditionsTrend,
} from "../lib/backend"

// Mock index-auth module since backend.ts imports it
vi.mock("@/auth", () => ({
  auth: vi.fn().mockResolvedValue({
    user: {
      id: "user-1",
      role: "ADMIN",
      countryId: null,
    },
  }),
}))

describe("app-siege backend library", () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  afterAll(() => {
    global.fetch = originalFetch
  })

  it("backendFetch - should make HTTP requests with M2M headers", async () => {
    const mockJson = { data: "test" }
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockJson),
    })

    const res = await backendFetch("http://localhost:3001", "/api/lots")
    expect(res).toEqual(mockJson)
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/api/lots",
      expect.objectContaining({
        headers: { "x-api-key": "test-service-key" },
      })
    )
  })

  it("getWarehouses - should consolidate warehouses across backend and filter by country", async () => {
    const warehouses = [
      { id: "w1", name: "Sao Paulo", countryId: "BR" },
      { id: "w2", name: "Bogota", countryId: "CO" },
    ]
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(warehouses),
    })

    const all = await getWarehouses()
    expect(all.length).toBe(2)

    const brOnly = await getWarehouses("BR")
    expect(brOnly.length).toBe(1)
    expect(brOnly[0].id).toBe("w1")
  })

  it("getLots - should retrieve lots sorted FIFO", async () => {
    const lots = [
      { id: "l1", reference: "LOT-A", storedAt: "2026-06-02T10:00:00.000Z", warehouse: { countryId: "BR" } },
      { id: "l2", reference: "LOT-B", storedAt: "2026-06-01T10:00:00.000Z", warehouse: { countryId: "BR" } },
    ]
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(lots),
    })

    const sorted = await getLots()
    expect(sorted.length).toBe(2)
    // l2 is older (June 1st vs June 2nd), should come first in FIFO sorting
    expect(sorted[0].id).toBe("l2")
  })

  it("getLotDetail - should return null if fetch fails", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"))
    const detail = await getLotDetail("invalid-id")
    expect(detail).toBeNull()
  })

  it("getDashboardStats - should calculate consolidated metrics correctly", async () => {
    const lots = [
      { id: "l1", status: "CONFORME", storedAt: new Date().toISOString(), warehouse: { countryId: "BR" } },
      { id: "l2", status: "PERIME", storedAt: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString(), warehouse: { countryId: "BR" } },
    ]
    const alerts = [
      { id: "a1", isResolved: false, createdAt: new Date().toISOString(), lot: { warehouse: { countryId: "BR" } } },
    ]

    global.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes("/api/lots")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(lots) })
      }
      if (url.includes("/api/alerts")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(alerts) })
      }
      return Promise.reject(new Error("unmatched url"))
    })

    const stats = await getDashboardStats()
    expect(stats.totalLots).toBe(2)
    expect(stats.activeAlerts).toBe(1)
    expect(stats.perime).toBe(1)
    expect(stats.lotsAdded30).toBe(1)
  })

  it("getMeasurements - trie les mesures par date croissante", async () => {
    const measurements = [
      { warehouseId: "w1", temperature: 1, humidity: 1, recordedAt: "2026-06-02T00:00:00.000Z" },
      { warehouseId: "w1", temperature: 2, humidity: 2, recordedAt: "2026-06-01T00:00:00.000Z" },
    ]
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(measurements),
    })

    const res = await getMeasurements("lot-1")
    expect(res).toHaveLength(2)
    expect(new Date(res[0].recordedAt).getTime()).toBeLessThan(
      new Date(res[1].recordedAt).getTime(),
    )
  })

  it("getLotAlerts - récupère les alertes d'un lot", async () => {
    const alerts = [{ id: "a1", type: "SEUIL_TEMPERATURE", lotId: "lot-1" }]
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(alerts),
    })

    const res = await getLotAlerts("lot-1")
    expect(res).toHaveLength(1)
    expect(res[0].id).toBe("a1")
  })

  it("getAlerts - agrège les alertes (ADMIN → tous pays)", async () => {
    const alerts = [
      { id: "a1", lot: { warehouse: { countryId: "BR" } } },
      { id: "a2", lot: { warehouse: { countryId: "CO" } } },
    ]
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(alerts),
    })

    const res = await getAlerts()
    expect(res).toHaveLength(2)
  })

  it("getConditionsTrend - moyennes journalières temp/humidité, entrepôts filtrés", async () => {
    const warehouses = [{ id: "w1", name: "W1", countryId: "BR" }]
    const measurements = [
      { warehouseId: "w1", temperature: 28, humidity: 55, recordedAt: "2026-06-10T08:00:00.000Z" },
      { warehouseId: "w1", temperature: 30, humidity: 57, recordedAt: "2026-06-10T16:00:00.000Z" },
      // Entrepôt non autorisé → doit être ignoré
      { warehouseId: "wX", temperature: 99, humidity: 99, recordedAt: "2026-06-10T16:00:00.000Z" },
    ]
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/api/warehouses")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(warehouses) })
      }
      if (url.includes("/api/measurements")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(measurements) })
      }
      return Promise.reject(new Error("unmatched url"))
    })

    const trend = await getConditionsTrend()
    expect(trend).toHaveLength(1)
    expect(trend[0].date).toBe("2026-06-10")
    expect(trend[0].avgTemp).toBe(29) // (28 + 30) / 2
    expect(trend[0].avgHumidity).toBe(56) // (55 + 57) / 2
  })
})
