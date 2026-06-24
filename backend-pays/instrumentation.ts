export async function register() {
  // instrumentation.ts s'exécute aussi dans le runtime Edge — on garde le worker Node.js uniquement
  if (process.env.NEXT_RUNTIME !== "nodejs") return

  const { startMqttWorker } = await import("@/lib/mqtt-worker")

  startMqttWorker()
  // Alerting et péremption délégués à Node-RED (ADR-0007)
}
