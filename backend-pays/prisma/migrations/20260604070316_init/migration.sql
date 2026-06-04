-- Activer l'extension TimescaleDB (doit être avant la création des tables)
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- CreateEnum
CREATE TYPE "LotStatus" AS ENUM ('CONFORME', 'EN_ALERTE', 'PERIME');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('SEUIL_TEMPERATURE', 'SEUIL_HUMIDITE', 'PEREMPTION');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MANAGER_PAYS', 'VIEWER');

-- CreateTable
CREATE TABLE "countries" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "idealTemp" DOUBLE PRECISION NOT NULL,
    "tempTolerance" DOUBLE PRECISION NOT NULL,
    "idealHumidity" DOUBLE PRECISION NOT NULL,
    "humidityTolerance" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "countries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,

    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lots" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "reference" TEXT NOT NULL,
    "warehouseId" UUID NOT NULL,
    "storedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "LotStatus" NOT NULL DEFAULT 'CONFORME',

    CONSTRAINT "lots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "measurements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "warehouseId" UUID NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL,
    "humidity" DOUBLE PRECISION NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "measurements_pkey" PRIMARY KEY ("id","recordedAt")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "lotId" UUID NOT NULL,
    "type" "AlertType" NOT NULL,
    "message" TEXT NOT NULL,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'VIEWER',
    "countryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lots_reference_key" ON "lots"("reference");

-- Convertir measurements en hypertable TimescaleDB (partitionnement par recordedAt)
SELECT create_hypertable('measurements', 'recordedAt');

-- CreateIndex
CREATE INDEX "measurements_warehouseId_recordedAt_idx" ON "measurements"("warehouseId", "recordedAt");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lots" ADD CONSTRAINT "lots_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "measurements" ADD CONSTRAINT "measurements_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "lots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;
