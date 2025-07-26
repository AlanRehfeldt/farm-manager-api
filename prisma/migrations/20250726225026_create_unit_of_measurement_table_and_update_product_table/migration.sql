/*
  Warnings:

  - You are about to drop the column `unit` on the `products` table. All the data in the column will be lost.
  - Added the required column `unitOfMeasurementId` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "products" DROP COLUMN "unit",
ADD COLUMN     "unitOfMeasurementId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "UnitOfMeasurement" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "acronym" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UnitOfMeasurement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UnitOfMeasurement_acronym_key" ON "UnitOfMeasurement"("acronym");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_unitOfMeasurementId_fkey" FOREIGN KEY ("unitOfMeasurementId") REFERENCES "UnitOfMeasurement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
