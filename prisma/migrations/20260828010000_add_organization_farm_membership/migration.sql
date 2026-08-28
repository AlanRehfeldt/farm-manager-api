-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "farms" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "timezone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "farms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memberships" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "farmId" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "memberships_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "farms_organizationId_name_key" ON "farms"("organizationId", "name");

-- CreateIndex
CREATE INDEX "farms_organizationId_idx" ON "farms"("organizationId");

-- CreateIndex
CREATE INDEX "memberships_userId_idx" ON "memberships"("userId");

-- CreateIndex
CREATE INDEX "memberships_organizationId_idx" ON "memberships"("organizationId");

-- AddForeignKey
ALTER TABLE "farms" ADD CONSTRAINT "farms_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Postgres treats NULL as distinct in unique indexes; enforce one org-wide membership per user.
CREATE UNIQUE INDEX "memberships_user_org_orgwide_key" ON "memberships"("userId", "organizationId") WHERE "farmId" IS NULL;
CREATE UNIQUE INDEX "memberships_user_org_farm_key" ON "memberships"("userId", "organizationId", "farmId") WHERE "farmId" IS NOT NULL;

-- Tenant columns (nullable first for backfill)
ALTER TABLE "employees" ADD COLUMN "organizationId" TEXT;
ALTER TABLE "employees" ADD COLUMN "farmId" TEXT;

ALTER TABLE "suppliers" ADD COLUMN "organizationId" TEXT;
ALTER TABLE "suppliers" ADD COLUMN "farmId" TEXT;

ALTER TABLE "cost_centers" ADD COLUMN "organizationId" TEXT;

ALTER TABLE "account_plans" ADD COLUMN "organizationId" TEXT;

ALTER TABLE "unit_of_measurements" ADD COLUMN "organizationId" TEXT;

ALTER TABLE "products" ADD COLUMN "organizationId" TEXT;
ALTER TABLE "products" ADD COLUMN "farmId" TEXT;

ALTER TABLE "transactions" ADD COLUMN "farmId" TEXT;

ALTER TABLE "stock_movements" ADD COLUMN "farmId" TEXT;

ALTER TABLE "product_stock_balances" ADD COLUMN "farmId" TEXT;

-- Backfill default organization + farm and existing rows
DO $$
DECLARE
  org_id TEXT := gen_random_uuid()::TEXT;
  farm_id TEXT := gen_random_uuid()::TEXT;
BEGIN
  INSERT INTO "organizations" ("id", "name", "createdAt", "updatedAt")
  VALUES (org_id, 'Default Organization', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

  INSERT INTO "farms" ("id", "organizationId", "name", "createdAt", "updatedAt")
  VALUES (farm_id, org_id, 'Default Farm', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

  UPDATE "employees" SET "organizationId" = org_id;
  UPDATE "suppliers" SET "organizationId" = org_id;
  UPDATE "cost_centers" SET "organizationId" = org_id;
  UPDATE "account_plans" SET "organizationId" = org_id;
  UPDATE "unit_of_measurements" SET "organizationId" = org_id;
  UPDATE "products" SET "organizationId" = org_id;

  UPDATE "transactions" SET "farmId" = farm_id;
  UPDATE "stock_movements" SET "farmId" = farm_id;
  UPDATE "product_stock_balances" SET "farmId" = farm_id;

  INSERT INTO "memberships" ("id", "userId", "organizationId", "farmId", "role", "createdAt", "updatedAt")
  SELECT gen_random_uuid()::TEXT, "id", org_id, NULL, 'ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
  FROM "users";
END $$;

-- Require tenant columns
ALTER TABLE "employees" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "suppliers" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "cost_centers" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "account_plans" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "unit_of_measurements" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "products" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "transactions" ALTER COLUMN "farmId" SET NOT NULL;
ALTER TABLE "stock_movements" ALTER COLUMN "farmId" SET NOT NULL;
ALTER TABLE "product_stock_balances" ALTER COLUMN "farmId" SET NOT NULL;

-- Replace global uniques with org/farm scoped uniques
DROP INDEX IF EXISTS "employees_registration_key";
DROP INDEX IF EXISTS "suppliers_cnpj_key";
DROP INDEX IF EXISTS "cost_centers_code_key";
DROP INDEX IF EXISTS "account_plans_code_key";
DROP INDEX IF EXISTS "unit_of_measurements_acronym_key";
DROP INDEX IF EXISTS "product_stock_balances_productId_key";

CREATE UNIQUE INDEX "employees_organizationId_registration_key" ON "employees"("organizationId", "registration");
CREATE UNIQUE INDEX "suppliers_organizationId_cnpj_key" ON "suppliers"("organizationId", "cnpj");
CREATE UNIQUE INDEX "cost_centers_organizationId_code_key" ON "cost_centers"("organizationId", "code");
CREATE UNIQUE INDEX "account_plans_organizationId_code_key" ON "account_plans"("organizationId", "code");
CREATE UNIQUE INDEX "unit_of_measurements_organizationId_acronym_key" ON "unit_of_measurements"("organizationId", "acronym");
CREATE UNIQUE INDEX "product_stock_balances_farmId_productId_key" ON "product_stock_balances"("farmId", "productId");

CREATE INDEX "employees_organizationId_idx" ON "employees"("organizationId");
CREATE INDEX "employees_farmId_idx" ON "employees"("farmId");
CREATE INDEX "suppliers_organizationId_idx" ON "suppliers"("organizationId");
CREATE INDEX "suppliers_farmId_idx" ON "suppliers"("farmId");
CREATE INDEX "cost_centers_organizationId_idx" ON "cost_centers"("organizationId");
CREATE INDEX "account_plans_organizationId_idx" ON "account_plans"("organizationId");
CREATE INDEX "unit_of_measurements_organizationId_idx" ON "unit_of_measurements"("organizationId");
CREATE INDEX "products_organizationId_idx" ON "products"("organizationId");
CREATE INDEX "products_farmId_idx" ON "products"("farmId");
CREATE INDEX "transactions_farmId_idx" ON "transactions"("farmId");
CREATE INDEX "stock_movements_farmId_idx" ON "stock_movements"("farmId");
CREATE INDEX "stock_movements_productId_idx" ON "stock_movements"("productId");
CREATE INDEX "product_stock_balances_farmId_idx" ON "product_stock_balances"("farmId");

-- Foreign keys for tenant columns
ALTER TABLE "employees" ADD CONSTRAINT "employees_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "employees" ADD CONSTRAINT "employees_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "farms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "farms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "cost_centers" ADD CONSTRAINT "cost_centers_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "account_plans" ADD CONSTRAINT "account_plans_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "unit_of_measurements" ADD CONSTRAINT "unit_of_measurements_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "products" ADD CONSTRAINT "products_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "products" ADD CONSTRAINT "products_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "farms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "transactions" ADD CONSTRAINT "transactions_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "farms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "farms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "product_stock_balances" ADD CONSTRAINT "product_stock_balances_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "farms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
