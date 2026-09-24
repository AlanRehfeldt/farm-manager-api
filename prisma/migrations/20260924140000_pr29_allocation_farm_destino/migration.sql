-- PR-29: TransactionAllocation.farmId = fazenda destino do rateio
-- (pode diferir de Transaction.farmId pagador; mesma organização)

ALTER TABLE "transaction_allocations" ADD COLUMN "farmId" TEXT;

UPDATE "transaction_allocations" ta
SET "farmId" = t."farmId"
FROM "transactions" t
WHERE ta."transactionId" = t."id";

ALTER TABLE "transaction_allocations" ALTER COLUMN "farmId" SET NOT NULL;

CREATE INDEX "transaction_allocations_farmId_idx" ON "transaction_allocations"("farmId");

ALTER TABLE "transaction_allocations"
  ADD CONSTRAINT "transaction_allocations_farmId_fkey"
  FOREIGN KEY ("farmId") REFERENCES "farms"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
