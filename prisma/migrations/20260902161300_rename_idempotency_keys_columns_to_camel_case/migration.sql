-- Align idempotency_keys with the rest of the schema: columns are camelCase
-- (Prisma field names without @map). The original table used snake_case.

ALTER TABLE "idempotency_keys" RENAME COLUMN "farm_id" TO "farmId";
ALTER TABLE "idempotency_keys" RENAME COLUMN "body_hash" TO "bodyHash";
ALTER TABLE "idempotency_keys" RENAME COLUMN "status_code" TO "statusCode";
ALTER TABLE "idempotency_keys" RENAME COLUMN "response_json" TO "responseJson";
ALTER TABLE "idempotency_keys" RENAME COLUMN "created_at" TO "createdAt";

ALTER INDEX "idempotency_keys_farm_id_idx" RENAME TO "idempotency_keys_farmId_idx";
ALTER INDEX "idempotency_keys_farm_id_key_key" RENAME TO "idempotency_keys_farmId_key_key";

ALTER TABLE "idempotency_keys" RENAME CONSTRAINT "idempotency_keys_farm_id_fkey" TO "idempotency_keys_farmId_fkey";
