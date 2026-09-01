-- CreateEnum
CREATE TYPE "UomDimension" AS ENUM ('MASS', 'VOLUME', 'COUNT', 'AREA', 'TIME');

-- AlterTable
ALTER TABLE "unit_of_measurements"
  ADD COLUMN "dimension" "UomDimension",
  ADD COLUMN "isBase" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "factorToBase" DECIMAL(18, 6);

-- Backfill existing rows (legacy UoMs treated as MASS base units)
UPDATE "unit_of_measurements"
SET
  "dimension" = 'MASS',
  "factorToBase" = 1,
  "isBase" = true
WHERE "dimension" IS NULL;

ALTER TABLE "unit_of_measurements"
  ALTER COLUMN "dimension" SET NOT NULL,
  ALTER COLUMN "factorToBase" SET NOT NULL;
