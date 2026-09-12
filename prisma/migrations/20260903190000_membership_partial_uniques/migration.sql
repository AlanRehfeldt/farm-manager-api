-- Partial unique indexes: Postgres treats NULLs as distinct in UNIQUE,
-- so org-wide memberships (farmId IS NULL) need a dedicated index.

CREATE UNIQUE INDEX "memberships_user_org_wide_unique"
ON "memberships" ("userId", "organizationId")
WHERE "farmId" IS NULL;

CREATE UNIQUE INDEX "memberships_user_org_farm_unique"
ON "memberships" ("userId", "organizationId", "farmId")
WHERE "farmId" IS NOT NULL;
