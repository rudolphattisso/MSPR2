import { PrismaPg } from "@prisma/adapter-pg"
import pkg from "pg"
import { PrismaClient } from "@/app/generated/prisma/client"

const { Pool } = pkg
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }
// Match the running docker-compose DB defaults (if container already created)
// If Docker maps Postgres to host 5433 to avoid local conflicts, tests use that port.
// Force the original test connection string under Vitest/Node test to avoid SASL/credential issues
const TEST_DB_URL = process.env.TEST_DATABASE_URL ?? "postgresql://futurekawa:FutureKawa2026%21@localhost:5432/db_pays"

function createClient() {
  const isTest = Boolean(process.env.VITEST || process.env.NODE_ENV === "test")
  const connectionString = isTest ? TEST_DB_URL : process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error("DATABASE_URL must be defined for Prisma client initialization")
  }

  if (isTest) {
    // Debug: show the connection string used during tests (safe to mask in CI if needed)
    try {
      const masked = connectionString.replace(/:(.*)@/, ":****@")
      // eslint-disable-next-line no-console
      console.error("[prisma] using connection:", masked)
    } catch {
      // ignore
    }
  }

  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createClient()
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma