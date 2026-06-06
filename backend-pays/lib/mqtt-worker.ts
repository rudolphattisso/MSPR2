import mqtt from "mqtt"
import { checkMeasurementAlerts } from "@/lib/alert-rules"
import { prisma } from "@/lib/prisma"

const BROKER_URL = process.env.MQTT_BROKER_URL ?? "mqtt://localhost:1883"
const TOPIC = "futurekawa/mesure"

type MesurePayload = {
  warehouseId: string
  temperature: number
  humidity: number
  recordedAt?: string
}

function isValidPayload(data: unknown): data is MesurePayload {
  if (typeof data !== "object" || data === null) return false
  const d = data as Record<string, unknown>
  return (
    typeof d.warehouseId === "string" &&
    typeof d.temperature === "number" &&
    typeof d.humidity === "number"
  )
}

export function startMqttWorker(): void {
  const client = mqtt.connect(BROKER_URL, { clean: true })

  client.on("connect", () => {
    console.log(`[mqtt] Connecté à ${BROKER_URL}`)
    client.subscribe(TOPIC, { qos: 1 }, (err) => {
      if (err) console.error("[mqtt] Échec abonnement:", err)
      else console.log(`[mqtt] Abonné à ${TOPIC}`)
    })
  })

  client.on("message", async (_topic, raw) => {
    let data: unknown
    try {
      data = JSON.parse(raw.toString())
    } catch {
      console.warn("[mqtt] Payload non-JSON ignoré:", raw.toString())
      return
    }

    if (!isValidPayload(data)) {
      console.warn("[mqtt] Payload invalide ignoré:", data)
      return
    }

    try {
      await prisma.measurement.create({
        data: {
          warehouseId: data.warehouseId,
          temperature: data.temperature,
          humidity: data.humidity,
          ...(data.recordedAt ? { recordedAt: new Date(data.recordedAt) } : {}),
        },
      })

      // Fire-and-forget identique à la route POST /api/measurements
      checkMeasurementAlerts(
        data.warehouseId,
        data.temperature,
        data.humidity
      ).catch((err) => console.error("[mqtt] checkMeasurementAlerts failed:", err))
    } catch (err) {
      console.error("[mqtt] Erreur insertion mesure:", err)
    }
  })

  client.on("error", (err) => console.error("[mqtt] Erreur client:", err))
  client.on("reconnect", () => console.log("[mqtt] Reconnexion en cours..."))
}
