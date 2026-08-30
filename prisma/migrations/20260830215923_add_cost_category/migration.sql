-- CreateTable
CREATE TABLE "cost_categories" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,
    "accountPlanId" TEXT,
    "externalRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cost_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cost_categories_organizationId_idx" ON "cost_categories"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "cost_categories_organizationId_code_key" ON "cost_categories"("organizationId", "code");

-- AddForeignKey
ALTER TABLE "cost_categories" ADD CONSTRAINT "cost_categories_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_categories" ADD CONSTRAINT "cost_categories_accountPlanId_fkey" FOREIGN KEY ("accountPlanId") REFERENCES "account_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_categories" ADD CONSTRAINT "cost_categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "cost_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
