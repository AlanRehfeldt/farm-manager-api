-- AlterEnum
ALTER TYPE "PlatformRole" ADD VALUE 'PLATFORM_SUPPORT';

-- CreateTable
CREATE TABLE "support_accesses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "grantedByUserId" TEXT NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_accesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_audit_logs" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT,
    "organizationId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "platform_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "support_accesses_userId_idx" ON "support_accesses"("userId");

-- CreateIndex
CREATE INDEX "support_accesses_organizationId_idx" ON "support_accesses"("organizationId");

-- One active grant per support user and organization.
CREATE UNIQUE INDEX "support_accesses_active_user_org_unique"
ON "support_accesses" ("userId", "organizationId")
WHERE "revokedAt" IS NULL;

-- CreateIndex
CREATE INDEX "platform_audit_logs_createdAt_idx" ON "platform_audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "platform_audit_logs_organizationId_idx" ON "platform_audit_logs"("organizationId");

-- CreateIndex
CREATE INDEX "platform_audit_logs_actorUserId_idx" ON "platform_audit_logs"("actorUserId");

-- AddForeignKey
ALTER TABLE "support_accesses" ADD CONSTRAINT "support_accesses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_accesses" ADD CONSTRAINT "support_accesses_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_accesses" ADD CONSTRAINT "support_accesses_grantedByUserId_fkey" FOREIGN KEY ("grantedByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_audit_logs" ADD CONSTRAINT "platform_audit_logs_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
