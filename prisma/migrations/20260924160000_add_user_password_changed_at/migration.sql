-- AlterTable
ALTER TABLE "users" ADD COLUMN "passwordChangedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Backfill existing users from createdAt
UPDATE "users" SET "passwordChangedAt" = "createdAt";
