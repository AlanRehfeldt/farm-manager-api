/*
  Warnings:

  - You are about to drop the column `type` on the `account_plans` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code]` on the table `cost_centers` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `description` to the `account_plans` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "account_plans" DROP COLUMN "type",
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "parentId" TEXT;

-- DropEnum
DROP TYPE "AccountType";

-- CreateIndex
CREATE UNIQUE INDEX "cost_centers_code_key" ON "cost_centers"("code");

-- AddForeignKey
ALTER TABLE "account_plans" ADD CONSTRAINT "account_plans_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "account_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;
