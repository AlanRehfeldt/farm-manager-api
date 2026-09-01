-- Product name unique per organization
CREATE UNIQUE INDEX IF NOT EXISTS "products_organization_id_name_key" ON "products"("organizationId", "name");

-- Crop season name unique per farm
CREATE UNIQUE INDEX IF NOT EXISTS "crop_seasons_farm_id_name_key" ON "crop_seasons"("farmId", "name");

-- Membership: one org-wide row and one row per farm per user/org
CREATE UNIQUE INDEX IF NOT EXISTS "memberships_user_org_orgwide_key"
  ON "memberships"("userId", "organizationId")
  WHERE "farmId" IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "memberships_user_org_farm_key"
  ON "memberships"("userId", "organizationId", "farmId")
  WHERE "farmId" IS NOT NULL;

-- Crop.defaultProductionUomId required (backfill from first org UoM)
UPDATE "crops" AS c
SET "defaultProductionUomId" = (
  SELECT u.id
  FROM "unit_of_measurements" AS u
  WHERE u."organizationId" = c."organizationId"
  ORDER BY u."createdAt" ASC
  LIMIT 1
)
WHERE c."defaultProductionUomId" IS NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'crops'
      AND column_name = 'defaultProductionUomId'
      AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE "crops" ALTER COLUMN "defaultProductionUomId" SET NOT NULL;
  END IF;
END $$;
