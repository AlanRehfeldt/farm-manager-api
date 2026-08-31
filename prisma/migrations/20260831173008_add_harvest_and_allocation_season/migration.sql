/*
  Warnings:

  - Added the required column `costCategoryId` to the `transaction_allocations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cropSeasonId` to the `transaction_allocations` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "HarvestQualityClass" AS ENUM ('EXPORT', 'DOMESTIC', 'INDUSTRY', 'REJECT', 'OTHER');

-- AlterTable
ALTER TABLE "transaction_allocations" ADD COLUMN     "costCategoryId" TEXT NOT NULL,
ADD COLUMN     "cropSeasonId" TEXT NOT NULL,
ADD COLUMN     "fieldId" TEXT;

-- CreateTable
CREATE TABLE "harvests" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "cropSeasonId" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "lotCode" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "harvests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "harvest_items" (
    "id" TEXT NOT NULL,
    "harvestId" TEXT NOT NULL,
    "qualityClass" "HarvestQualityClass" NOT NULL DEFAULT 'OTHER',
    "quantity" DECIMAL(18,6) NOT NULL,
    "uomId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "harvest_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "harvests_farmId_idx" ON "harvests"("farmId");

-- CreateIndex
CREATE INDEX "harvests_cropSeasonId_date_idx" ON "harvests"("cropSeasonId", "date");

-- CreateIndex
CREATE INDEX "harvest_items_harvestId_idx" ON "harvest_items"("harvestId");

-- CreateIndex
CREATE INDEX "transaction_allocations_cropSeasonId_idx" ON "transaction_allocations"("cropSeasonId");

-- AddForeignKey
ALTER TABLE "transaction_allocations" ADD CONSTRAINT "transaction_allocations_costCategoryId_fkey" FOREIGN KEY ("costCategoryId") REFERENCES "cost_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_allocations" ADD CONSTRAINT "transaction_allocations_cropSeasonId_fkey" FOREIGN KEY ("cropSeasonId") REFERENCES "crop_seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_allocations" ADD CONSTRAINT "transaction_allocations_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "fields"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "harvests" ADD CONSTRAINT "harvests_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "farms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "harvests" ADD CONSTRAINT "harvests_cropSeasonId_fkey" FOREIGN KEY ("cropSeasonId") REFERENCES "crop_seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "harvests" ADD CONSTRAINT "harvests_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "fields"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "harvest_items" ADD CONSTRAINT "harvest_items_harvestId_fkey" FOREIGN KEY ("harvestId") REFERENCES "harvests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "harvest_items" ADD CONSTRAINT "harvest_items_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "unit_of_measurements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
