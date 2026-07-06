import { describe, it, expect, vi, beforeEach } from "vitest"
import { startMqttWorker } from "../lib/mqtt-worker"
import { prisma } from "../lib/prisma"
import mqtt from "mqtt"

vi.mock("mqtt", () => {
  const mockClient = {
    on: vi.fn(),
    subscribe: vi.fn((topic, opts, callback) => {
      if (callback) callback(null)
    }),
  }
  return {
    default: {
      connect: vi.fn().mockReturnValue(mockClient),
    },
  }
})

describe("MQTT Worker", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should connect, subscribe to topic, and save measurement on message", async () => {
    const mockClient = mqtt.connect("mock-url")
    const eventHandlers: Record<string, Function> = {}

    mockClient.on = vi.fn().mockImplementation((event, handler) => {
      eventHandlers[event] = handler
      return mockClient
    })

    startMqttWorker()

    // Trigger connect event
    expect(eventHandlers["connect"]).toBeDefined()
    eventHandlers["connect"]()
    expect(mockClient.subscribe).toHaveBeenCalledWith("futurekawa/mesure", { qos: 1 }, expect.any(Function))

    // Trigger message event with valid payload
    const warehouseId = "00000000-0000-0000-0000-000000000001"
    const payload = JSON.stringify({
      warehouseId,
      temperature: 28.5,
      humidity: 54.2,
      recordedAt: new Date().toISOString(),
    })

    expect(eventHandlers["message"]).toBeDefined()
    await eventHandlers["message"]("futurekawa/mesure", Buffer.from(payload))

    // Check if measurement was created in database
    const measurements = await prisma.measurement.findMany({
      where: { warehouseId },
      orderBy: { recordedAt: "desc" },
    })

    expect(measurements.length).toBeGreaterThan(0)
    expect(measurements[0].temperature).toBe(28.5)
    expect(measurements[0].humidity).toBe(54.2)
  })

  it("should ignore invalid or non-JSON payloads", async () => {
    const mockClient = mqtt.connect("mock-url")
    const eventHandlers: Record<string, Function> = {}

    mockClient.on = vi.fn().mockImplementation((event, handler) => {
      eventHandlers[event] = handler
      return mockClient
    })

    startMqttWorker()

    const beforeCount = await prisma.measurement.count()

    // Message 1: invalid json
    await eventHandlers["message"]("futurekawa/mesure", Buffer.from("invalid-json"))

    // Message 2: missing fields
    await eventHandlers["message"]("futurekawa/mesure", Buffer.from(JSON.stringify({ temperature: 30 })))

    const afterCount = await prisma.measurement.count()
    expect(afterCount).toBe(beforeCount)
  })
})
