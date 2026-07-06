import { PrismaPg } from "@prisma/adapter-pg"
import pkg from "pg"
import { PrismaClient } from "@/app/generated/prisma/client"

const { Pool } = pkg
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

// Connexion pilotée par DATABASE_URL : en dev/prod via .env / docker-compose,
// en test via vitest.config.ts (base de test dédiée sur le port 5433).
function createClient() {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error("DATABASE_URL must be defined for Prisma client initialization")
  }

  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createClient()
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma