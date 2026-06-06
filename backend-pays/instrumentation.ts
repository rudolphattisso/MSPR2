export async function register() {
  // instrumentation.ts s'exécute aussi dans le runtime Edge — on garde le worker Node.js uniquement
  if (process.env.NEXT_RUNTIME !== "nodejs") return

  const { startMqttWorker } = await import("@/lib/mqtt-worker")
  const { checkAllLotExpirations } = await import("@/lib/alert-rules")

  startMqttWorker()

  checkAllLotExpirations().catch((err) =>
    console.error("[startup] checkAllLotExpirations failed:", err)
  )
}
