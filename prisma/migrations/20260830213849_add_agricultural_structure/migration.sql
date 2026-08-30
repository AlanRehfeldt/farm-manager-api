-- CreateEnum
CREATE TYPE "CropSeasonStatus" AS ENUM ('PLANNED', 'ACTIVE', 'CLOSED');

-- CreateTable
CREATE TABLE "fields" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "areaHa" DECIMAL(18,6) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "plantsPerHa" DECIMAL(18,6),
    "plantedYear" INTEGER,
    "spacingNote" TEXT,
    "externalRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crops" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "defaultProductionUomId" TEXT,
    "externalRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "varieties" (
    "id" TEXT NOT NULL,
    "cropId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "externalRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "varieties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crop_seasons" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "cropId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" "CropSeasonStatus" NOT NULL DEFAULT 'PLANNED',
    "productionUomId" TEXT NOT NULL,
    "referenceSalePriceInCents" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crop_seasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crop_plantings" (
    "id" TEXT NOT NULL,
    "cropSeasonId" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "varietyId" TEXT,
    "plantedAreaHa" DECIMAL(18,6),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crop_plantings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machines" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hourlyCostInCents" BIGINT NOT NULL,
    "fuelIncludedInHourlyCost" BOOLEAN NOT NULL DEFAULT true,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "machines_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "fields_farmId_idx" ON "fields"("farmId");

-- CreateIndex
CREATE UNIQUE INDEX "fields_farmId_name_key" ON "fields"("farmId", "name");

-- CreateIndex
CREATE INDEX "crops_organizationId_idx" ON "crops"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "crops_organizationId_name_key" ON "crops"("organizationId", "name");

-- CreateIndex
CREATE INDEX "varieties_cropId_idx" ON "varieties"("cropId");

-- CreateIndex
CREATE UNIQUE INDEX "varieties_cropId_name_key" ON "varieties"("cropId", "name");

-- CreateIndex
CREATE INDEX "crop_seasons_farmId_idx" ON "crop_seasons"("farmId");

-- CreateIndex
CREATE INDEX "crop_seasons_cropId_idx" ON "crop_seasons"("cropId");

-- CreateIndex
CREATE INDEX "crop_plantings_cropSeasonId_idx" ON "crop_plantings"("cropSeasonId");

-- CreateIndex
CREATE INDEX "crop_plantings_fieldId_idx" ON "crop_plantings"("fieldId");

-- CreateIndex
CREATE UNIQUE INDEX "crop_plantings_cropSeasonId_fieldId_key" ON "crop_plantings"("cropSeasonId", "fieldId");

-- CreateIndex
CREATE INDEX "machines_farmId_idx" ON "machines"("farmId");

-- CreateIndex
CREATE UNIQUE INDEX "machines_farmId_name_key" ON "machines"("farmId", "name");

-- AddForeignKey
ALTER TABLE "fields" ADD CONSTRAINT "fields_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "farms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crops" ADD CONSTRAINT "crops_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crops" ADD CONSTRAINT "crops_defaultProductionUomId_fkey" FOREIGN KEY ("defaultProductionUomId") REFERENCES "unit_of_measurements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "varieties" ADD CONSTRAINT "varieties_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "crops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crop_seasons" ADD CONSTRAINT "crop_seasons_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "farms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crop_seasons" ADD CONSTRAINT "crop_seasons_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "crops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crop_seasons" ADD CONSTRAINT "crop_seasons_productionUomId_fkey" FOREIGN KEY ("productionUomId") REFERENCES "unit_of_measurements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crop_plantings" ADD CONSTRAINT "crop_plantings_cropSeasonId_fkey" FOREIGN KEY ("cropSeasonId") REFERENCES "crop_seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crop_plantings" ADD CONSTRAINT "crop_plantings_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "fields"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crop_plantings" ADD CONSTRAINT "crop_plantings_varietyId_fkey" FOREIGN KEY ("varietyId") REFERENCES "varieties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machines" ADD CONSTRAINT "machines_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "farms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
