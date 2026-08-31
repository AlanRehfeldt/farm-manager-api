-- CreateEnum
CREATE TYPE "LaborPayBasis" AS ENUM ('HOUR', 'DAY', 'OUTPUT');

-- CreateTable
CREATE TABLE "activity_labor" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "employeeId" TEXT,
    "contractorName" TEXT,
    "payBasis" "LaborPayBasis" NOT NULL,
    "hours" DECIMAL(18,6),
    "days" DECIMAL(18,6),
    "outputQty" DECIMAL(18,6),
    "costInCents" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activity_labor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_machine_hours" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "hours" DECIMAL(18,6) NOT NULL,
    "hourlyCostSnapshot" BIGINT NOT NULL,
    "costInCents" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activity_machine_hours_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activity_labor_activityId_idx" ON "activity_labor"("activityId");

-- CreateIndex
CREATE INDEX "activity_machine_hours_activityId_idx" ON "activity_machine_hours"("activityId");

-- AddForeignKey
ALTER TABLE "activity_labor" ADD CONSTRAINT "activity_labor_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_labor" ADD CONSTRAINT "activity_labor_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_machine_hours" ADD CONSTRAINT "activity_machine_hours_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_machine_hours" ADD CONSTRAINT "activity_machine_hours_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "machines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
