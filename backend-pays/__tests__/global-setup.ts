import { execSync } from "node:child_process"

// Base de TEST dédiée (service docker-compose `db-test`, port hôte 5433).
// URL forcée en dur : garantit qu'on ne touche JAMAIS la base de dev (5432).
const TEST_DATABASE_URL =
  "postgresql://futurekawa:futurekawa_secret@localhost:5433/futurekawa"

// Exécuté une seule fois avant toute la suite de tests :
//   1. génère le client Prisma
//   2. applique le schéma (migrations) sur la base de test
//   3. seed les données de référence (pays + entrepôts) requises par les tests
export default function setup() {
  const env = { ...process.env, DATABASE_URL: TEST_DATABASE_URL }
  execSync("npx prisma generate", { stdio: "inherit" })
  execSync("npx prisma migrate deploy", { stdio: "inherit", env })
  execSync("npx prisma db seed", { stdio: "inherit", env })
}
