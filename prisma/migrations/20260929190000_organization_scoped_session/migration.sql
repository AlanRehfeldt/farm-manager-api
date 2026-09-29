-- CreateEnum
CREATE TYPE "OrganizationSelection" AS ENUM ('EXEMPT', 'PENDING', 'BOUND');

-- AlterTable
ALTER TABLE "refresh_tokens" ADD COLUMN "organizationId" TEXT;
ALTER TABLE "refresh_tokens" ADD COLUMN "organizationSelection" "OrganizationSelection" NOT NULL DEFAULT 'EXEMPT';

-- Sessões anteriores ao PR-25 não têm organizationId. Revoga os refresh ainda válidos.
UPDATE "refresh_tokens" SET "revokedAt" = CURRENT_TIMESTAMP WHERE "revokedAt" IS NULL;
