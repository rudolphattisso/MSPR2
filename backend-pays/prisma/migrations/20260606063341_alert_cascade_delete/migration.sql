-- DropForeignKey
ALTER TABLE "alerts" DROP CONSTRAINT "alerts_lotId_fkey";

-- DropIndex
DROP INDEX "measurements_recordedAt_idx";

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "lots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
