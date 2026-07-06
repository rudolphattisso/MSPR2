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

// Initialisation paresseuse : le client réel n'est créé qu'au premier accès
// (au runtime, avec DATABASE_URL défini) — pas à l'import. Ainsi `next build`
// n'exige pas DATABASE_URL (les handlers d'API ne sont pas exécutés au build).
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client =
      globalForPrisma.prisma ?? (globalForPrisma.prisma = createClient())
    const value = Reflect.get(client, prop, client)
    return typeof value === "function" ? value.bind(client) : value
  },
})