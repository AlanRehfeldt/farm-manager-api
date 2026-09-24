-- AlterTable Installment: flag for client-side smart split (PR-28)
ALTER TABLE "installments" ADD COLUMN "manuallyAdjusted" BOOLEAN NOT NULL DEFAULT false;
