import { vi, beforeEach, afterAll } from "vitest"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, "../.env") })

process.env.POSTGRES_USER = String(process.env.POSTGRES_USER ?? "futurekawa")
process.env.POSTGRES_PASSWORD = String(process.env.POSTGRES_PASSWORD ?? "FutureKawa2026!")
process.env.POSTGRES_DB = String(process.env.POSTGRES_DB ?? "db_pays")
process.env.POSTGRES_HOST = String(process.env.POSTGRES_HOST ?? "localhost")
process.env.POSTGRES_PORT = String(process.env.POSTGRES_PORT ?? "5432")
process.env.DATABASE_URL = String(
  process.env.DATABASE_URL ?? "postgresql://futurekawa:FutureKawa2026%21@localhost:5432/db_pays"
)
process.env.SERVICE_API_KEY = String(process.env.SERVICE_API_KEY ?? "test-service-key")
process.env.SMTP_HOST = String(process.env.SMTP_HOST ?? "localhost")
process.env.SMTP_PORT = String(process.env.SMTP_PORT ?? "1025")
process.env.SMTP_USER = String(process.env.SMTP_USER ?? "test@mailhog.local")
process.env.SMTP_PASSWORD = String(process.env.SMTP_PASSWORD ?? "test-password")
process.env.ALERT_EMAIL_TO = String(process.env.ALERT_EMAIL_TO ?? "alerts@futurekawa.local")

const { prisma } = await import("../lib/prisma.js")

vi.mock("nodemailer", () => ({
  default: {
    createTransport: vi.fn().mockReturnValue({
      sendMail: vi.fn().mockResolvedValue({ messageId: "mock-message-id" }),
    }),
  },
}))

beforeEach(async () => {
  try {
    if (prisma) {
      await prisma.verificationToken.deleteMany().catch(() => {})
      await prisma.alert.deleteMany().catch(() => {})
      await prisma.measurement.deleteMany().catch(() => {})
      await prisma.lot.deleteMany().catch(() => {})
      await prisma.user.deleteMany().catch(() => {})
    }
  } catch (error) {
    console.error("Erreur durant le reset de la DB locale :", error)
  }
})

afterAll(async () => {
  if (prisma) {
    await prisma.$disconnect()
  }
})