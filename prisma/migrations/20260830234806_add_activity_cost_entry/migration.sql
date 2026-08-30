-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('PREPARATION', 'FERTILIZATION', 'PHYTOSANITARY', 'IRRIGATION', 'MANAGEMENT', 'HARVEST', 'OTHER');

-- CreateEnum
CREATE TYPE "CostEntrySourceType" AS ENUM ('ACTIVITY_INPUT', 'ACTIVITY_LABOR', 'ACTIVITY_MACHINE', 'ALLOCATION', 'REVERSAL');

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "cropSeasonId" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "activityType" "ActivityType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_inputs" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" DECIMAL(18,6) NOT NULL,
    "unitCostSnapshot" DECIMAL(18,8) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activity_inputs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cost_entries" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "cropSeasonId" TEXT NOT NULL,
    "fieldId" TEXT,
    "activityId" TEXT,
    "sourceType" "CostEntrySourceType" NOT NULL,
    "sourceId" TEXT NOT NULL,
    "costCategoryId" TEXT NOT NULL,
    "amountInCents" BIGINT NOT NULL,
    "quantity" DECIMAL(18,6),
    "uomId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "reversedAt" TIMESTAMP(3),
    "reversalOfId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cost_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activities_farmId_idx" ON "activities"("farmId");

-- CreateIndex
CREATE INDEX "activities_cropSeasonId_date_idx" ON "activities"("cropSeasonId", "date");

-- CreateIndex
CREATE INDEX "activity_inputs_activityId_idx" ON "activity_inputs"("activityId");

-- CreateIndex
CREATE INDEX "cost_entries_cropSeasonId_idx" ON "cost_entries"("cropSeasonId");

-- CreateIndex
CREATE INDEX "cost_entries_farmId_date_idx" ON "cost_entries"("farmId", "date");

-- CreateIndex
CREATE INDEX "cost_entries_sourceType_sourceId_idx" ON "cost_entries"("sourceType", "sourceId");

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "farms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_cropSeasonId_fkey" FOREIGN KEY ("cropSeasonId") REFERENCES "crop_seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "fields"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_inputs" ADD CONSTRAINT "activity_inputs_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_inputs" ADD CONSTRAINT "activity_inputs_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_entries" ADD CONSTRAINT "cost_entries_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "farms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_entries" ADD CONSTRAINT "cost_entries_cropSeasonId_fkey" FOREIGN KEY ("cropSeasonId") REFERENCES "crop_seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_entries" ADD CONSTRAINT "cost_entries_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "fields"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_entries" ADD CONSTRAINT "cost_entries_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_entries" ADD CONSTRAINT "cost_entries_costCategoryId_fkey" FOREIGN KEY ("costCategoryId") REFERENCES "cost_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_entries" ADD CONSTRAINT "cost_entries_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "unit_of_measurements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_entries" ADD CONSTRAINT "cost_entries_reversalOfId_fkey" FOREIGN KEY ("reversalOfId") REFERENCES "cost_entries"("id") ON DELETE SET NULL ON UPDATE CASCADE;
