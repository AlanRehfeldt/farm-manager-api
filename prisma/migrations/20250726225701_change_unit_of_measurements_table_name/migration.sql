/*
  Warnings:

  - You are about to drop the `UnitOfMeasurement` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_unitOfMeasurementId_fkey";

-- DropTable
DROP TABLE "UnitOfMeasurement";

-- CreateTable
CREATE TABLE "unit_of_measurements" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "acronym" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "unit_of_measurements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "unit_of_measurements_acronym_key" ON "unit_of_measurements"("acronym");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_unitOfMeasurementId_fkey" FOREIGN KEY ("unitOfMeasurementId") REFERENCES "unit_of_measurements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
