-- AlterTable
ALTER TABLE "organizations" ADD COLUMN "lastAccessAt" TIMESTAMP(3),
ADD COLUMN "lastActivityAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "organizations_status_lastActivityAt_idx" ON "organizations"("status", "lastActivityAt");

-- CreateIndex
CREATE INDEX "organizations_status_lastAccessAt_idx" ON "organizations"("status", "lastAccessAt");

-- CreateIndex
CREATE INDEX "activities_createdAt_idx" ON "activities"("createdAt");

-- CreateIndex
CREATE INDEX "activities_farmId_createdAt_idx" ON "activities"("farmId", "createdAt");

-- CreateIndex
CREATE INDEX "transactions_farmId_createdAt_idx" ON "transactions"("farmId", "createdAt");

-- CreateIndex
CREATE INDEX "harvests_farmId_createdAt_idx" ON "harvests"("farmId", "createdAt");

-- Backfill once. These scans stay in the migration, not on the request path.
UPDATE "organizations" AS organization
SET "lastActivityAt" = activity_max.max_created
FROM (
  SELECT farm."organizationId" AS organization_id, MAX(activity."createdAt") AS max_created
  FROM "activities" AS activity
  INNER JOIN "farms" AS farm ON farm.id = activity."farmId"
  GROUP BY farm."organizationId"
) AS activity_max
WHERE organization.id = activity_max.organization_id;

UPDATE "organizations" AS organization
SET "lastAccessAt" = access_max.max_created
FROM (
  SELECT membership."organizationId" AS organization_id, MAX(refresh_token."createdAt") AS max_created
  FROM "memberships" AS membership
  INNER JOIN "users" AS "user" ON "user".id = membership."userId"
    AND "user"."platformRole" = 'NONE'
  INNER JOIN "refresh_tokens" AS refresh_token
    ON refresh_token."userId" = membership."userId"
    AND refresh_token."organizationId" = membership."organizationId"
  GROUP BY membership."organizationId"
) AS access_max
WHERE organization.id = access_max.organization_id;
