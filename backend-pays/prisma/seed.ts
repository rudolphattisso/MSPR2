import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ── Helpers ──────────────────────────────────────────────────────────────────
const now = new Date();
const daysAgo = (n: number) => new Date(now.getTime() - n * 86_400_000);
const hoursAgo = (n: number) => new Date(now.getTime() - n * 3_600_000);
const rint = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const rfloat = (min: number, max: number) => Math.random() * (max - min) + min;
const noise = (amp: number) => rfloat(-amp, amp);
const pick = <T>(arr: readonly T[]) => arr[rint(0, arr.length - 1)];
const round1 = (n: number) => Math.round(n * 10) / 10;

type Status = "CONFORME" | "EN_ALERTE" | "PERIME";
type AlertT = "SEUIL_TEMPERATURE" | "SEUIL_HUMIDITE" | "PEREMPTION";

async function main() {
  // ── Pays (seuils CDC) ──────────────────────────────────────────────────────
  const countryDefs = [
    { id: "BR", name: "Brésil", idealTemp: 29, tempTolerance: 3, idealHumidity: 55, humidityTolerance: 2 },
    { id: "EC", name: "Équateur", idealTemp: 31, tempTolerance: 3, idealHumidity: 60, humidityTolerance: 2 },
    { id: "CO", name: "Colombie", idealTemp: 26, tempTolerance: 3, idealHumidity: 80, humidityTolerance: 2 },
  ];
  for (const c of countryDefs) {
    await prisma.country.upsert({ where: { id: c.id }, update: {}, create: c });
  }
  const countryById = Object.fromEntries(countryDefs.map((c) => [c.id, c]));
  console.log(`✓ ${countryDefs.length} pays`);

  // ── Entrepôts : 3 fixes (contrat IoT) + 3 nouveaux ─────────────────────────
  const warehouseDefs = [
    { id: "00000000-0000-0000-0000-000000000001", name: "Entrepôt São Paulo", countryId: "BR" },
    { id: "00000000-0000-0000-0000-000000000004", name: "Entrepôt Santos", countryId: "BR" },
    { id: "00000000-0000-0000-0000-000000000002", name: "Entrepôt Quito", countryId: "EC" },
    { id: "00000000-0000-0000-0000-000000000005", name: "Entrepôt Guayaquil", countryId: "EC" },
    { id: "00000000-0000-0000-0000-000000000003", name: "Entrepôt Bogotá", countryId: "CO" },
    { id: "00000000-0000-0000-0000-000000000006", name: "Entrepôt Medellín", countryId: "CO" },
  ];
  for (const w of warehouseDefs) {
    await prisma.warehouse.upsert({ where: { id: w.id }, update: { name: w.name }, create: w });
  }
  console.log(`✓ ${warehouseDefs.length} entrepôts`);

  // ── Reset des données générées (idempotent) ────────────────────────────────
  await prisma.alert.deleteMany({});
  await prisma.measurement.deleteMany({});
  await prisma.lot.deleteMany({});

  // ── Lots : ~13 par entrepôt, dates variées, statut selon l'âge ──────────────
  const counter: Record<string, number> = { BR: 0, EC: 0, CO: 0 };
  const lotsData: { reference: string; warehouseId: string; storedAt: Date; status: Status }[] = [];

  for (const w of warehouseDefs) {
    for (let i = 0; i < 13; i++) {
      const ageDays = rint(3, 460);
      const storedAt = daysAgo(ageDays);
      const cc = w.countryId;
      counter[cc] += 1;
      const reference = `${cc}-${storedAt.getFullYear()}-${String(counter[cc]).padStart(3, "0")}`;
      const status: Status =
        ageDays > 365 ? "PERIME" : Math.random() < 0.28 ? "EN_ALERTE" : "CONFORME";
      lotsData.push({ reference, warehouseId: w.id, storedAt, status });
    }
  }
  await prisma.lot.createMany({ data: lotsData });
  const lots = await prisma.lot.findMany();
  console.log(`✓ ${lots.length} lots`);

  // ── Mesures : série 30 jours par entrepôt (un point / 8 h) ─────────────────
  const measurements: {
    warehouseId: string;
    temperature: number;
    humidity: number;
    recordedAt: Date;
  }[] = [];
  for (const w of warehouseDefs) {
    const c = countryById[w.countryId];
    for (let i = 0; i < 90; i++) {
      let temp = c.idealTemp + noise(1.2);
      let hum = c.idealHumidity + noise(1.0);
      if (Math.random() < 0.08) temp += pick([-1, 1]) * rfloat(4, 7); // excursion temp
      if (Math.random() < 0.08) hum += pick([-1, 1]) * rfloat(3, 6); // excursion humidité
      measurements.push({
        warehouseId: w.id,
        temperature: round1(temp),
        humidity: round1(hum),
        recordedAt: hoursAgo(i * 8),
      });
    }
  }
  await prisma.measurement.createMany({ data: measurements });
  console.log(`✓ ${measurements.length} mesures`);

  // ── Alertes datées (pour le widget « dernières alertes ») ──────────────────
  const whCountry = Object.fromEntries(warehouseDefs.map((w) => [w.id, w.countryId]));
  const alerts: {
    lotId: string;
    type: AlertT;
    message: string;
    isResolved: boolean;
    createdAt: Date;
  }[] = [];

  for (const lot of lots) {
    const c = countryById[whCountry[lot.warehouseId]];
    if (lot.status === "PERIME") {
      alerts.push({
        lotId: lot.id,
        type: "PEREMPTION",
        message: "Lot dépassant 365 jours de stockage",
        isResolved: false,
        createdAt: hoursAgo(rint(1, 360)),
      });
    } else if (lot.status === "EN_ALERTE") {
      for (let j = 0; j < rint(1, 2); j++) {
        const type: AlertT = pick(["SEUIL_TEMPERATURE", "SEUIL_HUMIDITE"]);
        const message =
          type === "SEUIL_TEMPERATURE"
            ? `Température ${round1(c.idealTemp + pick([-1, 1]) * rfloat(4, 7))}°C hors seuil (idéal : ${c.idealTemp}°C ±${c.tempTolerance}°C)`
            : `Humidité ${round1(c.idealHumidity + pick([-1, 1]) * rfloat(3, 6))}% hors seuil (idéal : ${c.idealHumidity}% ±${c.humidityTolerance}%)`;
        alerts.push({
          lotId: lot.id,
          type,
          message,
          isResolved: Math.random() < 0.2,
          createdAt: hoursAgo(rint(1, 300)),
        });
      }
    }
  }
  await prisma.alert.createMany({ data: alerts });
  console.log(`✓ ${alerts.length} alertes`);

  // ── Utilisateurs ───────────────────────────────────────────────────────────
  const password = await bcrypt.hash("FutureKawa2026!", 10);
  const usersData = [
    { email: "admin@futurekawa.com", name: "Admin Siège", role: "ADMIN" as const, countryId: null },
    { email: "manager.br@futurekawa.com", name: "Manager Brésil", role: "MANAGER_PAYS" as const, countryId: "BR" },
    { email: "manager.ec@futurekawa.com", name: "Manager Équateur", role: "MANAGER_PAYS" as const, countryId: "EC" },
    { email: "manager.co@futurekawa.com", name: "Manager Colombie", role: "MANAGER_PAYS" as const, countryId: "CO" },
    { email: "viewer@futurekawa.com", name: "Observateur", role: "VIEWER" as const, countryId: null },
  ];
  for (const user of usersData) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: { ...user, password, emailVerified: now },
    });
  }
  console.log(`✓ ${usersData.length} utilisateurs`);
  console.log(`\n  Mot de passe : FutureKawa2026!\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
