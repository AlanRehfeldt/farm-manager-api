-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('CLT', 'CONTRACTOR');

-- AlterTable
ALTER TABLE "employees"
ADD COLUMN "employmentType" "EmploymentType" NOT NULL DEFAULT 'CONTRACTOR',
ADD COLUMN "monthlySalaryInCents" BIGINT,
ADD COLUMN "expectedMonthlyHours" DECIMAL(18, 6);

-- AlterTable
ALTER TABLE "activity_labor"
ALTER COLUMN "costInCents" DROP NOT NULL,
ADD COLUMN "hourlyRateInCents" BIGINT;

CREATE INDEX "activity_labor_employeeId_idx" ON "activity_labor"("employeeId");

-- CreateTable
CREATE TABLE "labor_month_closings" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "salaryInCents" BIGINT NOT NULL,
    "totalHours" DECIMAL(18, 6) NOT NULL,
    "closedByUserId" TEXT NOT NULL,
    "closedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "labor_month_closings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "labor_month_closings_employeeId_year_month_key" ON "labor_month_closings"("employeeId", "year", "month");
CREATE INDEX "labor_month_closings_organizationId_year_month_idx" ON "labor_month_closings"("organizationId", "year", "month");

ALTER TABLE "labor_month_closings" ADD CONSTRAINT "labor_month_closings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "labor_month_closings" ADD CONSTRAINT "labor_month_closings_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "labor_month_closings" ADD CONSTRAINT "labor_month_closings_closedByUserId_fkey" FOREIGN KEY ("closedByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
