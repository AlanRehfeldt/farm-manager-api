/*
  Warnings:

  - You are about to drop the column `value` on the `installments` table. All the data in the column will be lost.
  - Added the required column `valueInCents` to the `installments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "installments" DROP COLUMN "value",
ADD COLUMN     "valueInCents" BIGINT NOT NULL;
