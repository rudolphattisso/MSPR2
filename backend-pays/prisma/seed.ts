import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // ---------------------------------------------------------------------------
  // Countries — seuils métier définis dans le CDC
  // ---------------------------------------------------------------------------
  const countries = await Promise.all([
    prisma.country.upsert({
      where: { id: "BR" },
      update: {},
      create: {
        id: "BR",
        name: "Brésil",
        idealTemp: 29,
        tempTolerance: 3,
        idealHumidity: 55,
        humidityTolerance: 2,
      },
    }),
    prisma.country.upsert({
      where: { id: "EC" },
      update: {},
      create: {
        id: "EC",
        name: "Équateur",
        idealTemp: 31,
        tempTolerance: 3,
        idealHumidity: 60,
        humidityTolerance: 2,
      },
    }),
    prisma.country.upsert({
      where: { id: "CO" },
      update: {},
      create: {
        id: "CO",
        name: "Colombie",
        idealTemp: 26,
        tempTolerance: 3,
        idealHumidity: 80,
        humidityTolerance: 2,
      },
    }),
  ]);
  console.log(`✓ ${countries.length} pays créés`);

  // ---------------------------------------------------------------------------
  // Warehouses — un entrepôt par pays pour le prototype
  // ---------------------------------------------------------------------------
  const [whBR, whEC, whCO] = await Promise.all([
    prisma.warehouse.upsert({
      where: { id: "00000000-0000-0000-0000-000000000001" },
      update: {},
      create: {
        id: "00000000-0000-0000-0000-000000000001",
        name: "Entrepôt São Paulo",
        countryId: "BR",
      },
    }),
    prisma.warehouse.upsert({
      where: { id: "00000000-0000-0000-0000-000000000002" },
      update: {},
      create: {
        id: "00000000-0000-0000-0000-000000000002",
        name: "Entrepôt Quito",
        countryId: "EC",
      },
    }),
    prisma.warehouse.upsert({
      where: { id: "00000000-0000-0000-0000-000000000003" },
      update: {},
      create: {
        id: "00000000-0000-0000-0000-000000000003",
        name: "Entrepôt Bogotá",
        countryId: "CO",
      },
    }),
  ]);
  console.log(`✓ 3 entrepôts créés`);

  // ---------------------------------------------------------------------------
  // Lots — 3 par entrepôt : CONFORME, EN_ALERTE, PERIME (>365 jours)
  // ---------------------------------------------------------------------------
  const now = new Date();
  const daysAgo = (n: number) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000);

  const lotsData = [
    // Brésil
    { reference: "BR-2026-001", warehouseId: whBR.id, storedAt: daysAgo(30),  status: "CONFORME"  as const },
    { reference: "BR-2025-042", warehouseId: whBR.id, storedAt: daysAgo(200), status: "EN_ALERTE" as const },
    { reference: "BR-2024-018", warehouseId: whBR.id, storedAt: daysAgo(400), status: "PERIME"    as const },
    // Équateur
    { reference: "EC-2026-001", warehouseId: whEC.id, storedAt: daysAgo(15),  status: "CONFORME"  as const },
    { reference: "EC-2025-033", warehouseId: whEC.id, storedAt: daysAgo(180), status: "EN_ALERTE" as const },
    { reference: "EC-2024-007", warehouseId: whEC.id, storedAt: daysAgo(380), status: "PERIME"    as const },
    // Colombie
    { reference: "CO-2026-001", warehouseId: whCO.id, storedAt: daysAgo(10),  status: "CONFORME"  as const },
    { reference: "CO-2025-021", warehouseId: whCO.id, storedAt: daysAgo(250), status: "EN_ALERTE" as const },
    { reference: "CO-2024-003", warehouseId: whCO.id, storedAt: daysAgo(370), status: "PERIME"    as const },
  ];

  for (const lot of lotsData) {
    await prisma.lot.upsert({
      where: { reference: lot.reference },
      update: {},
      create: lot,
    });
  }
  console.log(`✓ ${lotsData.length} lots créés`);

  // ---------------------------------------------------------------------------
  // Users — admin siège + un manager par pays + un viewer
  // ---------------------------------------------------------------------------
  const password = await bcrypt.hash("FutureKawa2026!", 10);

  const usersData = [
    { email: "admin@futurekawa.com",      name: "Admin Siège",        role: "ADMIN"        as const, countryId: null },
    { email: "manager.br@futurekawa.com", name: "Manager Brésil",     role: "MANAGER_PAYS" as const, countryId: "BR" },
    { email: "manager.ec@futurekawa.com", name: "Manager Équateur",   role: "MANAGER_PAYS" as const, countryId: "EC" },
    { email: "manager.co@futurekawa.com", name: "Manager Colombie",   role: "MANAGER_PAYS" as const, countryId: "CO" },
    { email: "viewer@futurekawa.com",     name: "Observateur",        role: "VIEWER"       as const, countryId: null },
  ];

  for (const user of usersData) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: { ...user, password },
    });
  }
  console.log(`✓ ${usersData.length} utilisateurs créés`);
  console.log(`\n  Mot de passe par défaut : FutureKawa2026!`);
  console.log(`  (À changer impérativement en production)\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
