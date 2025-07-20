/*
  Warnings:

  - Changed the type of `cnpj` on the `suppliers` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "suppliers" DROP COLUMN "cnpj",
ADD COLUMN     "cnpj" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_cnpj_key" ON "suppliers"("cnpj");
